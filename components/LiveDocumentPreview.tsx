import React, { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Download, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { PlanSection, SectionStatus, ProjectAsset } from '../types';
import { GLOSSARY_TERMS } from '../constants';

interface LiveDocumentPreviewProps {
  projectName: string;
  sections: PlanSection[];
  assets: ProjectAsset[];
  onClose: () => void;
}

export const LiveDocumentPreview: React.FC<LiveDocumentPreviewProps> = ({ projectName, sections, assets, onClose }) => {
  const docRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    const checkScripts = () => {
      if (window.jspdf && window.html2canvas) {
        setScriptsLoaded(true);
      }
    };

    checkScripts();
    const interval = setInterval(checkScripts, 500);
    return () => clearInterval(interval);
  }, []);

  // Filter only completed/approved sections and sort by ID to ensure correct order
  const sortedSections = sections
    .filter(s => s.status === SectionStatus.COMPLETED || s.status === SectionStatus.APPROVED)
    .sort((a, b) => {
      const aIsNumeric = /^\d+(\.\d+)*$/.test(a.id);
      const bIsNumeric = /^\d+(\.\d+)*$/.test(b.id);

      // If both are standard numeric IDs, sort them numerically
      if (aIsNumeric && bIsNumeric) {
          const aParts = a.id.split('.').map(Number);
          const bParts = b.id.split('.').map(Number);
          for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
              const valA = aParts[i] || 0;
              const valB = bParts[i] || 0;
              if (valA !== valB) return valA - valB;
          }
          return 0;
      }

      // Fallback for non-numeric or mixed IDs (e.g., 'ai-gen-...')
      // This puts numeric IDs before non-numeric ones if mixed.
      if (aIsNumeric && !bIsNumeric) return -1;
      if (!aIsNumeric && bIsNumeric) return 1;

      // If both are non-numeric, sort them as strings.
      return a.id.localeCompare(b.id);
    });

  const handleDownloadPdf = async () => {
    const input = docRef.current;
    if (!input) return;
    if (!window.jspdf || !window.html2canvas) {
      alert("As bibliotecas de geração de PDF ainda não carregaram. Aguarde um momento e tente novamente.");
      return;
    }
    
    setIsGeneratingPdf(true);
    
    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Use the html method with auto-paging
      await pdf.html(input, {
        callback: function (doc) {
          // Add page numbers
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(100);
            // Position at bottom center. A4 height is 297mm.
            doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, 287, { align: 'center' });
          }
          doc.save(`${projectName.replace(/[\s/]/g, '_')}_Plano_de_Negocios.pdf`);
        },
        margin: [20, 20, 20, 20], // margins in mm [top, right, bottom, left]
        autoPaging: 'text', // Breaks pages on text nodes
        html2canvas: {
          scale: 0.26, // Adjust scale for quality vs. size. (210mm / ~800px)
          useCORS: true,
          logging: false,
          windowWidth: input.scrollWidth,
          windowHeight: input.scrollHeight
        },
        pagebreak: { mode: 'css', before: '.break-before-page', after: '.break-after-page' }
      });

    } catch (e) {
      console.error("PDF generation failed", e);
      alert("Falha ao gerar o PDF. Verifique o console para mais detalhes.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  const handleDownloadMarkdown = () => {
    const content = sortedSections.map(s => `# ${s.title}\n\n${s.content}`).join('\n\n---\n\n');
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `GPN-${projectName}.md`;
    document.body.appendChild(element);
    element.click();
  };

  const getGlossaryTerms = (text: string) => {
    const termsFound: string[] = [];
    if (!text) return termsFound;
    
    Object.keys(GLOSSARY_TERMS).forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(text)) {
        termsFound.push(`**${term}**: ${GLOSSARY_TERMS[term]}`);
      }
    });
    return termsFound;
  };

  const MarkdownComponents = {
    h1: ({...props}) => <h1 className="text-2xl font-bold text-black mt-6 mb-4 border-b border-gray-300 pb-2" {...props} />,
    h2: ({...props}) => <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3" {...props} />,
    h3: ({...props}) => <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2" {...props} />,
    p: ({...props}) => <p className="text-gray-900 leading-relaxed mb-4 text-justify" {...props} />,
    ul: ({...props}) => <ul className="list-disc list-inside mb-4 text-gray-900 pl-4" {...props} />,
    li: ({...props}) => <li className="mb-1" {...props} />,
    table: ({...props}) => <div className="my-6 border border-gray-400"><table className="min-w-full divide-y divide-gray-400" {...props} /></div>,
    thead: ({...props}) => <thead className="bg-gray-100" {...props} />,
    th: ({...props}) => <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-300" {...props} />,
    td: ({...props}) => <td className="px-4 py-2 text-sm text-gray-900 border-t border-gray-300 border-r" {...props} />,
    strong: ({...props}) => <strong className="font-bold text-black" {...props} />,
    img: ({node, ...props}: any) => {
        // Resolve asset:// syntax
        let src = props.src || '';
        if (src.startsWith('asset://')) {
            const assetId = src.replace('asset://', '');
            const asset = assets.find(a => a.id === assetId);
            if (asset) {
                // Determine mime type based on asset type or data prefix if present (though stored as raw base64 usually)
                // Assuming raw base64 stored in data:
                const mimeType = asset.type === 'photo' ? 'image/jpeg' : 'image/png';
                src = `data:${mimeType};base64,${asset.data}`;
            }
        }
        return <img {...props} src={src} className="max-w-full h-auto my-6 rounded-lg shadow-md mx-auto print:block" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-400 flex flex-col">
      {/* Header Toolbar */}
      <div className="bg-white border-b border-gray-300 p-4 sticky top-0 z-50 flex justify-between items-center shadow-md print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Editor
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-lg font-bold text-gray-800 truncate max-w-md">
             Documento Final: {projectName}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownloadMarkdown} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            <FileText className="w-4 h-4" /> Baixar Texto
          </button>
          <button 
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || !scriptsLoaded}
            className="flex items-center justify-center gap-2 px-4 py-2 w-48 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm transition-colors disabled:bg-blue-400 disabled:cursor-wait"
          >
            {isGeneratingPdf ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando PDF...</span>
                </>
            ) : !scriptsLoaded ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Carregando Libs...</span>
                </>
            ) : (
                <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                </>
            )}
          </button>
        </div>
      </div>

      {/* Document Canvas (A4 Simulation) */}
      <div className="flex-1 overflow-y-auto p-8">
        <div ref={docRef}>
            {/* Cover Page */}
            <div className="page-a4 bg-white w-[210mm] h-[297mm] shadow-2xl p-[20mm] mx-auto my-8 print:shadow-none print:my-0 flex flex-col break-after-page">
                <div className="flex flex-col justify-center items-center h-full">
                    <h1 className="text-4xl font-bold text-center text-black mb-4 uppercase tracking-wider">{projectName}</h1>
                    <h2 className="text-2xl text-center text-gray-600 mb-12">Plano de Negócios</h2>
                    
                    <div className="mt-auto text-center text-gray-500 text-sm">
                        <p>Documento Gerado por Stratégia AI</p>
                        <p>{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Table of Contents */}
            <div className="page-a4 bg-white w-[210mm] h-[297mm] shadow-2xl p-[20mm] mx-auto my-8 print:shadow-none print:my-0 break-after-page">
                <h2 className="text-2xl font-bold mb-6 text-black border-b border-black pb-2">Sumário</h2>
                {/* FIX: Make Table of Contents items clickable links */}
                <div className="space-y-1">
                    {sortedSections.map(section => (
                        <a href={`#section-preview-${section.id}`} key={`toc-${section.id}`} className="flex justify-between text-sm p-2 rounded-md hover:bg-gray-100 no-underline group">
                            <span className="text-gray-900 font-medium truncate pr-2 group-hover:text-blue-600">{section.id} {section.title}</span>
                            <span className="border-b border-dotted border-gray-400 flex-grow mx-2 relative top-[-4px]"></span>
                        </a>
                    ))}
                </div>
            </div>

            {/* Content Pages */}
            {sortedSections.length > 0 && (
                <div className="page-a4 bg-white w-[210mm] shadow-2xl p-[20mm] mx-auto my-8 print:shadow-none print:my-0">
                    {sortedSections.map(section => {
                        const glossaryTerms = getGlossaryTerms(section.content);
                        return (
                            <div key={section.id} id={`section-preview-${section.id}`} className="break-before-page">
                                <div className="flex items-baseline gap-2 mb-4 border-b border-gray-200 pb-1">
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">{section.id}</span>
                                    <h2 className="text-xl font-bold text-black">{section.title}</h2>
                                </div>
                                <div className="prose prose-slate max-w-none text-justify text-black">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                        {typeof section.content === 'string' ? section.content : JSON.stringify(section.content)}
                                    </ReactMarkdown>
                                </div>
                                
                                {glossaryTerms.length > 0 && (
                                    <div className="mt-6 pt-3 border-t border-gray-300 text-[10px] text-gray-500 font-mono leading-tight">
                                        {glossaryTerms.map((term, idx) => (
                                            <span key={idx} className="mr-3 inline-block">
                                                <ReactMarkdown components={{p: ({node, ...props}) => <span {...props} />}}>{term}</ReactMarkdown>
                                                {idx < glossaryTerms.length - 1 && ";"}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, ArrowLeft, Loader2, BookOpen, Download, File } from 'lucide-react';
import { PlanSection, ProjectAsset } from '../types';
import { GLOSSARY_TERMS } from '../constants';
import { generateDocx } from '../services/generateDocx';
import { paginateContent, PaginatedResult } from '../services/paginateDocument';

interface LiveDocumentPreviewProps {
  projectName: string;
  sections: PlanSection[];
  assets: ProjectAsset[];
  onClose: () => void;
}

const A4_PAGE_STYLE: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  padding: '20mm',
  backgroundColor: 'white',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
};

const PAGE_CONTENT_STYLE: React.CSSProperties = {
  flexGrow: 1,
};

const PAGE_FOOTER_STYLE: React.CSSProperties = {
  position: 'absolute',
  bottom: '10mm',
  left: '20mm',
  right: '20mm',
  // FIX: Altura removida para permitir que o rodapé cresça se o glossário tiver várias linhas.
  display: 'flex',
  justifyContent: 'space-between',
  // FIX: Alinhado à base para melhor visualização com texto que quebra a linha.
  alignItems: 'flex-end',
  fontSize: '9pt',
  color: '#666',
};


export const LiveDocumentPreview: React.FC<LiveDocumentPreviewProps> = ({ projectName, sections, assets, onClose }) => {
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  
  const measureRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const [paginatedData, setPaginatedData] = useState<PaginatedResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);

  const sortedSections = sections
    .filter(s => s.content && s.content.trim() !== '');

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      if (measureRef.current) {
        const result = paginateContent(measureRef.current, 2);
        setPaginatedData(result);
        setIsCalculating(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [sections]);

  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      const blob = await generateDocx(projectName, sortedSections, assets);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/[\s/]/g, '_')}_Plano_de_Negocios.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar DOCX:", error);
      alert("Houve um erro ao gerar o arquivo Word. Tente novamente.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportPdf = async () => {
    if (!pagesContainerRef.current || !window.jspdf || !window.html2canvas) {
      alert("Erro: Biblioteca de geração de PDF não está pronta.");
      return;
    }
    setIsExportingPdf(true);
    
    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageElements = pagesContainerRef.current.querySelectorAll('.A4-page');

      for (let i = 0; i < pageElements.length; i++) {
        const page = pageElements[i] as HTMLElement;
        const canvas = await window.html2canvas(page, {
          scale: 2, // Aumenta a resolução para melhor qualidade
          useCORS: true,
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 210;
        const pdfHeight = 297;

        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`${projectName.replace(/[\s/]/g, '_')}_Plano_de_Negocios.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao gerar o arquivo PDF. Tente novamente.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const MarkdownComponents = {
    h1: ({node, ...props}: any) => <h1 id={props.id} className="chapter-start text-2xl font-bold text-black mt-0 mb-6 pb-2 border-b-2 border-gray-800 uppercase" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3 border-b border-gray-200 pb-1" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2" {...props} />,
    p: ({node, ...props}: any) => <p className="text-gray-900 leading-relaxed mb-3 text-justify text-sm" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-inside mb-4 text-gray-900 pl-4 text-sm" {...props} />,
    li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
    table: ({node, ...props}: any) => <div className="my-4 border border-gray-300 rounded overflow-hidden"><table className="min-w-full divide-y divide-gray-300" {...props} /></div>,
    thead: ({node, ...props}: any) => <thead className="bg-gray-100" {...props} />,
    th: ({node, ...props}: any) => <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300" {...props} />,
    td: ({node, ...props}: any) => <td className="px-3 py-2 text-xs text-gray-700 border-t border-gray-300 border-r" {...props} />,
    img: ({node, ...props}: any) => {
        let src = props.src || '';
        if (src.startsWith('asset://')) {
            const assetId = src.replace('asset://', '');
            const asset = assets.find(a => a.id === assetId);
            if (asset) {
                let mimeType = 'image/png';
                const base64Data = asset.data;
                if (base64Data.startsWith('/9j/')) mimeType = 'image/jpeg';
                else if (base64Data.startsWith('iVBORw0KGgo=')) mimeType = 'image/png';
                src = `data:${mimeType};base64,${base64Data}`;
            }
        }
        return <img {...props} src={src} className="max-w-full h-auto max-h-[400px] my-4 rounded shadow-sm mx-auto block" />;
    }
  };

  const getTermsOnPage = (pageHtml: string): string[] => {
    const foundTerms = new Set<string>();
    const termsRegex = new RegExp(`\\b(${Object.keys(GLOSSARY_TERMS).join('|')})\\b`, 'gi');
    const matches = pageHtml.match(termsRegex);

    if (matches) {
        new Set(matches.map(m => m.toUpperCase())).forEach(upperTerm => {
             const originalTerm = Object.keys(GLOSSARY_TERMS).find(t => t.toUpperCase() === upperTerm);
             if (originalTerm) {
                foundTerms.add(`${originalTerm}: ${GLOSSARY_TERMS[originalTerm]}`);
             }
        });
    }
    
    return Array.from(foundTerms).slice(0, 2);
  };


  return (
    <div className="min-h-screen bg-gray-500 flex flex-col font-sans">
      <div 
        ref={measureRef} 
        className="absolute top-0 left-0 w-[210mm] opacity-0 pointer-events-none p-[20mm] bg-white text-justify"
        style={{ zIndex: -1000 }}
      >
        {sortedSections.map(section => (
           <div key={`measure-${section.id}`}>
              <h1 id={section.id} className="chapter-start text-2xl font-bold text-black mt-0 mb-6 pb-2 border-b-2 border-gray-800 uppercase">
                {section.title}
              </h1>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                  ...MarkdownComponents,
                  h1: ({node, ...props}: any) => <h2 className="text-xl font-bold mt-4 mb-2" {...props} />
              }}>
                {section.content}
              </ReactMarkdown>
           </div>
        ))}
      </div>

      <header className="bg-white border-b border-gray-300 p-3 sticky top-0 z-50 flex justify-between items-center shadow-lg print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-700 hover:text-black font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" /> Voltar para o Editor
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportPdf}
            disabled={isExportingPdf || isCalculating}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-32"
          >
             {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin"/> : <><File className="w-4 h-4" /> Baixar .pdf</>}
          </button>
          <button 
            onClick={handleExportDocx}
            disabled={isExportingDocx || isCalculating}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all w-32"
          >
            {isExportingDocx ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Download className="w-4 h-4" /> Baixar .docx</>}
          </button>
        </div>
      </header>

      <main className="printable-area flex-1 overflow-auto p-8 bg-gray-500 print:bg-white print:p-0">
        {isCalculating ? (
          <div className="flex flex-col items-center justify-center text-white h-full">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-semibold">Calculando paginação do documento...</p>
          </div>
        ) : (
          <div ref={pagesContainerRef} className="space-y-8 mx-auto">
            {/* --- Cover Page --- */}
            <div className="A4-page" style={A4_PAGE_STYLE}>
              <div style={PAGE_CONTENT_STYLE} className="flex flex-col justify-center items-center text-center">
                <div className="w-full">
                  <h1 className="text-5xl font-bold text-gray-800">{projectName}</h1>
                  <p className="text-2xl mt-4 text-gray-600">Plano de Negócios</p>
                </div>
              </div>
              <div style={{ ...PAGE_FOOTER_STYLE, justifyContent: 'center', textAlign: 'center' }}>
                <div>
                    <p className="text-sm text-gray-500">GERADO POR</p>
                    <p className="text-lg font-semibold text-blue-800">Maicon Aloncio</p>
                    <p className="text-sm text-gray-500 mt-2">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* --- Table of Contents --- */}
            <div className="A4-page" style={A4_PAGE_STYLE}>
              <div style={PAGE_CONTENT_STYLE}>
                <h1 className="text-2xl font-bold mb-8 uppercase border-b-2 border-gray-800 pb-2">Sumário</h1>
                <ul className="space-y-3 text-sm">
                  {sortedSections.map(section => {
                    const pageNumber = paginatedData?.tocMap[section.id];
                    return (
                      <li key={`toc-${section.id}`} className="flex justify-between items-baseline">
                        <span className="truncate pr-2">{section.title}</span>
                        <span className="flex-grow border-b border-dotted border-gray-400 mx-2"></span>
                        <span className="font-mono">{pageNumber || '...'}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div style={PAGE_FOOTER_STYLE}>
                <span></span>
                <span>Página 2 de {paginatedData?.totalPages ? (paginatedData.totalPages + 2) : '...'}</span>
              </div>
            </div>
            
            {/* --- Content Pages --- */}
            {paginatedData?.pages.map((pageHtml, index) => {
              const terms = getTermsOnPage(pageHtml);
              const pageNumber = index + 1 + 2;
              return (
                <div key={`page-${index}`} className="A4-page" style={A4_PAGE_STYLE}>
                  <div style={PAGE_CONTENT_STYLE} dangerouslySetInnerHTML={{ __html: pageHtml }} />
                  <div style={PAGE_FOOTER_STYLE}>
                    <span className="text-xs text-gray-500">Confidencial</span>
                    {/* FIX: Classe 'truncate' removida para permitir a quebra de linha (wrap) do glossário. */}
                    <div className="text-[9px] text-gray-500 flex-1 text-center px-4">
                        {terms.length > 0 && <span>{terms.join(' | ')}</span>}
                    </div>
                    <span className="text-xs text-gray-500">Página {pageNumber} de {paginatedData?.totalPages ? (paginatedData.totalPages + 2) : '...'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

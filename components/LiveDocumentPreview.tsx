
import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Download, Printer, FileText, ArrowLeft } from 'lucide-react';
import { PlanSection, SectionStatus } from '../types';

interface LiveDocumentPreviewProps {
  projectName: string;
  sections: PlanSection[];
  onClose: () => void;
}

export const LiveDocumentPreview: React.FC<LiveDocumentPreviewProps> = ({ projectName, sections, onClose }) => {
  const docRef = useRef<HTMLDivElement>(null);

  // Filter only completed sections and sort by ID to ensure correct order
  // We assume IDs are like "1.0", "1.1.1", etc.
  const sortedSections = sections
    .filter(s => s.status === SectionStatus.COMPLETED)
    .sort((a, b) => {
      const aParts = a.id.split('.').map(Number);
      const bParts = b.id.split('.').map(Number);
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const valA = aParts[i] || 0;
        const valB = bParts[i] || 0;
        if (valA !== valB) return valA - valB;
      }
      return 0;
    });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const content = sortedSections.map(s => `# ${s.title}\n\n${s.content}`).join('\n\n---\n\n');
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `GPN-${projectName}.md`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
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
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
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
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm">
            <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* Document Canvas (A4 Simulation) */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div 
          ref={docRef} 
          className="bg-white w-[210mm] min-h-[297mm] shadow-xl p-[20mm] print:p-0 print:shadow-none print:w-full"
        >
            {/* Cover Page */}
            <div className="flex flex-col justify-center items-center h-[250mm] mb-[20mm] border-b-2 border-gray-900 pb-10">
                <h1 className="text-4xl font-bold text-center text-black mb-4 uppercase tracking-wider">{projectName}</h1>
                <h2 className="text-2xl text-center text-gray-600 mb-12">Plano de Negócios</h2>
                
                <div className="mt-auto text-center text-gray-500 text-sm">
                    <p>Documento Gerado por Stratégia AI</p>
                    <p>{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Table of Contents (Auto-generated) */}
            <div className="mb-[20mm] break-after-page">
                <h2 className="text-2xl font-bold mb-6 text-black border-b border-black pb-2">Sumário</h2>
                <div className="space-y-2">
                    {sortedSections.map(section => (
                        <div key={section.id} className="flex justify-between text-sm">
                            <span className="text-gray-900 font-medium">{section.chapter} - {section.title}</span>
                            <span className="border-b border-dotted border-gray-400 flex-grow mx-2 relative top-[-4px]"></span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Content */}
            <div className="space-y-10">
                {sortedSections.length === 0 ? (
                    <div className="text-center text-gray-400 py-20 italic">
                        Nenhum conteúdo gerado ainda. Volte ao editor e complete as seções.
                    </div>
                ) : (
                    sortedSections.map(section => (
                        <div key={section.id} className="mb-8">
                            <div className="flex items-baseline gap-2 mb-4 border-b border-gray-200 pb-1">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">{section.id}</span>
                                <h2 className="text-xl font-bold text-black">{section.title}</h2>
                            </div>
                            <div className="prose prose-slate max-w-none text-justify text-black">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                    {section.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

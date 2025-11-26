import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, ArrowLeft, FileCode, Loader2, Printer } from 'lucide-react';
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

export const LiveDocumentPreview: React.FC<LiveDocumentPreviewProps> = ({ projectName, sections, assets, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  
  // States para paginação
  const measureRef = useRef<HTMLDivElement>(null);
  const [paginatedData, setPaginatedData] = useState<PaginatedResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);

  const sortedSections = sections
    .filter(s => s.content && s.content.trim() !== '');

  // --- LOGICA DE PAGINAÇÃO ---
  useEffect(() => {
    // Aguarda o React renderizar o Markdown no container oculto
    const timer = setTimeout(() => {
      if (measureRef.current) {
        // Offset inicial de 2 páginas (1 Capa + 1 Sumário estimado)
        // Se o sumário crescer, a lógica poderia ser refinada, mas 1 página de sumário costuma bastar para pré-visualização.
        const result = paginateContent(measureRef.current, 2);
        setPaginatedData(result);
        setIsCalculating(false);
      }
    }, 500); // Pequeno delay para garantir que imagens/fontes carreguem layout

    return () => clearTimeout(timer);
  }, [sections]);

  const handleExportDocx = async () => {
    try {
      setIsExporting(true);
      // Passa os assets para garantir que imagens sejam incluídas no DOCX
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
      setIsExporting(false);
    }
  };

  const MarkdownComponents = {
    h1: ({...props}) => <h1 id={props.id} className="chapter-start text-2xl font-bold text-black mt-0 mb-6 pb-2 border-b-2 border-gray-800 uppercase" {...props} />,
    h2: ({...props}) => <h2 id={props.id} className="text-xl font-bold text-gray-800 mt-6 mb-3 border-b border-gray-200 pb-1" {...props} />,
    h3: ({...props}) => <h3 id={props.id} className="text-lg font-semibold text-gray-700 mt-4 mb-2" {...props} />,
    p: ({...props}) => <p className="text-gray-900 leading-relaxed mb-3 text-justify text-sm" {...props} />,
    ul: ({...props}) => <ul className="list-disc list-inside mb-4 text-gray-900 pl-4 text-sm" {...props} />,
    li: ({...props}) => <li className="mb-1" {...props} />,
    table: ({...props}) => <div className="my-4 border border-gray-300 rounded overflow-hidden"><table className="min-w-full divide-y divide-gray-300" {...props} /></div>,
    thead: ({...props}) => <thead className="bg-gray-100" {...props} />,
    th: ({...props}) => <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300" {...props} />,
    td: ({...props}) => <td className="px-3 py-2 text-xs text-gray-700 border-t border-gray-300 border-r" {...props} />,
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

  // Prepara o conteúdo Markdown bruto com IDs injetados para o TOC funcionar
  const fullMarkdownContent = sortedSections.map(section => {
    // Injeta IDs nos headers via sintaxe HTML ou processamento customizado seria ideal,
    // mas aqui vamos assumir que o ReactMarkdown renderiza na ordem.
    // Para simplificar a paginação visual, renderizamos Seção por Seção com wrapper DIV contendo o ID.
    return `
# ${section.title} <!-- {id: "${section.id}"} -->

${section.content}
    `;
  }).join('\n\n');

  return (
    <div className="min-h-screen bg-gray-500 flex flex-col font-sans">
      {/* --- HIDDEN MEASURE CONTAINER (IMPORTANTE: Renderiza todo o conteúdo para cálculo) --- */}
      <div 
        ref={measureRef} 
        className="absolute top-0 left-0 w-[210mm] opacity-0 pointer-events-none p-[20mm] bg-white text-justify"
        style={{ zIndex: -1000 }}
      >
        {sortedSections.map(section => (
           <div key={`measure-${section.id}`} id={section.id}>
              {/* O H1 precisa ter o ID da seção para o mapa do TOC funcionar */}
              <h1 id={section.id} className="chapter-start text-2xl font-bold text-black mt-0 mb-6 pb-2 border-b-2 border-gray-800 uppercase">
                {section.title}
              </h1>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                  ...MarkdownComponents,
                  h1: ({...props}) => <h2 className="text-xl font-bold mt-4 mb-2" {...props} /> // Downgrade inner H1s
              }}>
                {section.content}
              </ReactMarkdown>
           </div>
        ))}
      </div>

      {/* Header Toolbar */}
      <div className="bg-white border-b border-gray-300 p-3 sticky top-0 z-50 flex justify-between items-center shadow-lg print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-700 hover:text-black font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
             <h1 className="text-sm font-bold text-gray-800 truncate max-w-md">{projectName}</h1>
             <p className="text-xs text-gray-500">Visualização de Impressão (A4)</p>
          </div>
        </div>
        <div className="flex gap-3">
            {isCalculating && <span className="text-xs flex items-center gap-2 text-blue-600"><Loader2 className="w-3 h-3 animate-spin"/> Paginando...</span>}
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </button>
          <button 
            onClick={handleExportDocx}
            disabled={isExporting || isCalculating}
            className="flex items-center justify-center w-48 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileCode className="w-4 h-4 mr-2" />}
            {isExporting ? "Gerando Word..." : "Baixar .docx"}
          </button>
        </div>
      </div>

      {/* DOCUMENTO VISUAL (CANVAS) */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center gap-8 print:p-0 print:gap-0">
        
        {/* PÁGINA 1: CAPA */}
        <div className="page-a4 bg-white shadow-2xl print:shadow-none flex flex-col justify-between relative break-after-page">
            <div className="flex-1 flex flex-col justify-center items-center p-12 text-center border-b-8 border-blue-900">
                <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center mb-8">
                    <FileText className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight uppercase">{projectName}</h1>
                <h2 className="text-2xl text-gray-500 font-light">Plano de Negócios Profissional</h2>
            </div>
            <div className="bg-gray-50 p-12 text-center">
                <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Gerado por</p>
                <p className="font-bold text-blue-900">Stratégia AI</p>
                <p className="text-xs text-gray-400 mt-4">{new Date().toLocaleDateString()}</p>
            </div>
            {/* Numeração de Página (Capa geralmente não tem, mas mantendo padrão se desejar) */}
             <div className="absolute bottom-4 right-8 text-xs text-gray-400">Página 1</div>
        </div>

        {/* PÁGINA 2: SUMÁRIO */}
        <div className="page-a4 bg-white shadow-2xl print:shadow-none relative p-[20mm] break-after-page">
             <h2 className="text-2xl font-bold mb-8 text-black border-b-2 border-black pb-2 uppercase tracking-wide">Sumário Executivo</h2>
             
             {isCalculating ? (
                 <div className="flex items-center justify-center h-64 text-gray-400">
                     <Loader2 className="w-8 h-8 animate-spin mr-2" /> Calculando paginação...
                 </div>
             ) : (
                 <div className="space-y-1">
                     {sortedSections.map(section => {
                         const pageNum = paginatedData?.tocMap[section.id] || '-';
                         return (
                            <a href={`#${section.id}`} key={`toc-${section.id}`} className="flex items-baseline text-sm py-1.5 hover:bg-gray-50 group no-underline text-gray-800">
                                <span className="font-medium min-w-[30px] text-gray-500 text-xs">{section.id}</span>
                                <span className="font-semibold truncate mr-2 flex-1 group-hover:text-blue-700">{section.title}</span>
                                <span className="flex-1 border-b border-dotted border-gray-300 mx-1 relative -top-1"></span>
                                <span className="font-bold text-gray-900">{pageNum}</span>
                            </a>
                         );
                     })}
                 </div>
             )}
              <div className="absolute bottom-[20mm] right-[20mm] text-xs text-gray-400 border-t border-gray-200 pt-2 w-full text-right">
                Página 2
              </div>
        </div>

        {/* PÁGINAS DE CONTEÚDO (Geradas Dinamicamente) */}
        {!isCalculating && paginatedData?.pages.map((pageHtml, index) => (
            <div key={`page-${index}`} className="page-a4 bg-white shadow-2xl print:shadow-none relative p-[20mm] break-after-page flex flex-col">
                {/* Header da Página */}
                <div className="absolute top-[10mm] left-[20mm] right-[20mm] border-b border-gray-200 pb-2 flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-wider">
                     <span>{projectName}</span>
                     <span>Plano de Negócios</span>
                </div>

                {/* Conteúdo Injetado */}
                <div 
                    className="flex-1 mt-4"
                    dangerouslySetInnerHTML={{ __html: pageHtml }} 
                />

                {/* Footer da Página */}
                <div className="absolute bottom-[10mm] left-[20mm] right-[20mm] border-t border-gray-200 pt-2 flex justify-between items-center text-xs text-gray-500">
                    <span>Confidencial</span>
                    <span className="font-mono">Página {index + 3} de {paginatedData.totalPages}</span>
                </div>
            </div>
        ))}

      </div>

      <style>{`
        .page-a4 {
            width: 210mm;
            min-height: 297mm;
            height: 297mm; /* Altura fixa para visualização */
            overflow: hidden; /* Evita que conteúdo estoure visualmente */
        }
        @media print {
            body { background: white; }
            .page-a4 {
                width: 100%;
                height: 100%;
                box-shadow: none;
                margin: 0;
                page-break-after: always;
                border: none;
            }
            /* Esconde elementos de UI */
            button, .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};
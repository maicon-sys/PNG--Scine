import React from 'react';
import { X, CheckCircle, AlertTriangle, BookOpen, Scale, FileSearch, ShieldCheck, ClipboardList, Wand2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: string | null;
  isLoading: boolean;
  sectionTitle: string;
  onImplementCorrections?: () => void; // New callback
  isCorrecting?: boolean; // New state for button loader
}

export const ValidationModal: React.FC<ValidationModalProps> = ({ 
  isOpen, 
  onClose, 
  report, 
  isLoading, 
  sectionTitle,
  onImplementCorrections,
  isCorrecting = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isLoading ? 'bg-blue-100' : 'bg-purple-100'}`}>
              {isLoading ? (
                <FileSearch className="w-6 h-6 text-blue-600 animate-pulse" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Auditoria Técnica SEBRAE/BRDE</h3>
              <p className="text-xs text-gray-500 font-medium truncate max-w-md">
                Analisando: <span className="text-gray-800">{sectionTitle}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Scale className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-800">Auditando Tópico...</h4>
                <p className="text-sm text-gray-500 mt-1">Verificando consistência com a Matriz, regras do BRDE e metodologia.</p>
              </div>
            </div>
          ) : report ? (
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-md prose-p:text-sm prose-li:text-sm">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({...props}) => <h1 className="flex items-center gap-2 text-purple-800 border-b border-purple-100 pb-2 mb-4 mt-6" {...props} />,
                    h2: ({...props}) => <h2 className="text-gray-800 mt-6 mb-3" {...props} />,
                    ul: ({...props}) => <ul className="bg-gray-50 p-4 rounded-lg border border-gray-100 list-disc list-inside space-y-1" {...props} />,
                    li: ({...props}) => <li className="text-gray-700" {...props} />
                }}
              >
                {report}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <AlertTriangle className="w-12 h-12 mb-2 opacity-20" />
              <p>Não foi possível gerar o relatório.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-between items-center gap-4">
          <div className="text-xs text-gray-400">
             *A auto-correção utiliza o Google Search para buscar dados faltantes.
          </div>
          <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isCorrecting}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
              
              {onImplementCorrections && (
                  <button
                    onClick={onImplementCorrections}
                    disabled={isCorrecting || isLoading || !report}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCorrecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {isCorrecting ? 'Corrigindo...' : 'Implementar Correções com IA'}
                  </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
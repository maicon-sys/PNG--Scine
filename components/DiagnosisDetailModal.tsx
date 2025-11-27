import React, { useState, useRef } from 'react';
import { X, TrendingUp, AlertOctagon, Lightbulb, Shield, Book, CheckCircle, ChevronDown, MessageSquare, Paperclip, Send, Loader2, FileText } from 'lucide-react';
import { AnalysisGap, DiagnosisResponse, GapSeverity } from '../types';

interface DiagnosisDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosis: DiagnosisResponse;
  onReevaluateGap: (gapId: string, userText: string, files: File[]) => Promise<void>;
}

const severityMap: Record<GapSeverity, { text: string; icon: React.ReactNode; color: string }> = {
  A: { text: 'Grave', icon: <AlertOctagon className="w-4 h-4" />, color: 'text-red-600 bg-red-100 border-red-200' },
  B: { text: 'Moderada', icon: <TrendingUp className="w-4 h-4" />, color: 'text-yellow-600 bg-yellow-100 border-yellow-200' },
  C: { text: 'Leve', icon: <Lightbulb className="w-4 h-4" />, color: 'text-blue-600 bg-blue-100 border-blue-200' },
};

const ImprovementItem: React.FC<{ gap: AnalysisGap; onReevaluate: DiagnosisDetailModalProps['onReevaluateGap'] }> = ({ gap, onReevaluate }) => {
    const [isResolving, setIsResolving] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [isReanalyzing, setIsReanalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    }

    const handleReanalyze = async () => {
        setIsReanalyzing(true);
        await onReevaluate(gap.id, responseText, attachedFiles);
        setIsReanalyzing(false);
        // Não fecha a seção para o usuário ver o resultado
        setResponseText('');
        setAttachedFiles([]);
    };
    
    const isResolved = gap.status === 'RESOLVED';

    return (
        <div className={`p-4 border rounded-lg shadow-sm transition-all duration-300 ${isResolved ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
           <div className="flex justify-between items-start">
             <div>
                <h4 className={`font-semibold text-md mb-1 ${isResolved ? 'text-green-800' : 'text-gray-800'}`}>{gap.description}</h4>
                 <p className={`text-sm italic border-l-4 pl-3 py-1 ${isResolved ? 'border-green-300 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                    <span className="font-bold">IA:</span> "{gap.aiFeedback}"
                 </p>
             </div>
             <span className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full border ${isResolved ? 'text-green-600 bg-green-100 border-green-200' : severityMap[gap.severityLevel].color}`}>
                {isResolved ? <CheckCircle className="w-4 h-4" /> : severityMap[gap.severityLevel].icon}
                {isResolved ? 'Resolvido' : severityMap[gap.severityLevel].text}
             </span>
           </div>
           
           {/* Dicas de Melhoria */}
           <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50/50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-bold text-sm text-green-800 flex items-center gap-2 mb-1"><Book className="w-4 h-4" /> Visão SEBRAE</h4>
                    <p className="text-xs text-green-700">O SEBRAE exige um plano financeiro detalhado. Construa projeções de DRE, Fluxo de Caixa e Balanço para 5 anos. Use premissas claras para receitas, custos e investimentos, mostrando a viabilidade do negócio.</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-bold text-sm text-blue-800 flex items-center gap-2 mb-1"><Shield className="w-4 h-4" /> Visão BRDE</h4>
                    <p className="text-xs text-blue-700">O BRDE precisa de garantias sobre a sua capacidade de pagamento. As planilhas devem demonstrar um Índice de Cobertura do Serviço da Dívida (DSCR) superior a 1.3. Aponte claramente os usos e fontes dos recursos do financiamento.</p>
                </div>
           </div>

            {!isResolved && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button onClick={() => setIsResolving(!isResolving)} className="flex justify-between items-center w-full text-sm font-medium text-blue-600 hover:text-blue-800">
                        <span>{isResolving ? 'Fechar Seção de Resolução' : 'Resolver esta pendência'}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${isResolving ? 'rotate-180' : ''}`} />
                    </button>

                    {isResolving && (
                        <div className="mt-4 space-y-4 animate-in fade-in duration-300">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1"><MessageSquare className="w-3 h-3"/> Forneça mais detalhes ou responda à IA:</label>
                                <textarea 
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    placeholder="Ex: Segue anexa a pesquisa de mercado com 300 respondentes de SC, validando a faixa de preço de R$19,90..."
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm h-24 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                             <div>
                                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1"><Paperclip className="w-3 h-3"/> Anexar arquivos:</label>
                                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                                <button onClick={() => fileInputRef.current?.click()} className="w-full text-sm p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:bg-gray-50">
                                    Clique para selecionar (planilhas, PDFs, etc.)
                                </button>
                                {attachedFiles.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {attachedFiles.map((file, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs bg-gray-100 p-1.5 rounded">
                                                <span className="flex items-center gap-1"><FileText className="w-3 h-3"/> {file.name}</span>
                                                <button onClick={() => handleRemoveFile(i)} className="text-red-500 hover:text-red-700">
                                                    <X className="w-3 h-3"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={handleReanalyze}
                                disabled={isReanalyzing || (!responseText && attachedFiles.length === 0)}
                                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed">
                                {isReanalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4"/>}
                                {isReanalyzing ? 'Analisando...' : 'Reanalisar Ponto'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export const DiagnosisDetailModal: React.FC<DiagnosisDetailModalProps> = ({ isOpen, onClose, diagnosis, onReevaluateGap }) => {
  if (!isOpen) return null;

  const scoreColor = diagnosis.overallReadiness >= 75 ? 'text-green-600' : diagnosis.overallReadiness >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = diagnosis.overallReadiness >= 75 ? 'bg-green-100' : diagnosis.overallReadiness >= 50 ? 'bg-yellow-100' : 'bg-red-100';

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${scoreBg}`}>
              <TrendingUp className={`w-6 h-6 ${scoreColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Análise de Prontidão do Projeto</h3>
              <p className="text-xs text-gray-500 font-medium">
                Detalhes do diagnóstico e plano de ação para melhoria
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

        <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
            <div className="flex items-start justify-between mb-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase">Nível de Prontidão</h4>
                     <p className={`text-6xl font-bold ${scoreColor}`}>{diagnosis.overallReadiness}<span className="text-4xl">%</span></p>
                </div>
                <div className="text-right max-w-md">
                     <p className="text-sm text-gray-700">
                        Este percentual representa o quão completo e alinhado o seu projeto está com as melhores práticas do <strong className="text-green-700">SEBRAE</strong> e os critérios de análise de risco do <strong className="text-blue-700">BRDE</strong>.
                     </p>
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4">Pontos de Melhoria Identificados</h3>
            <div className="space-y-6">
                {diagnosis.gaps.length > 0 ? (
                    diagnosis.gaps.map(gap => (
                        <ImprovementItem key={gap.id} gap={gap} onReevaluate={onReevaluateGap} />
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                        <p className="font-semibold">Nenhuma lacuna crítica encontrada!</p>
                        <p className="text-sm">O projeto parece bem estruturado. Continue refinando os detalhes.</p>
                    </div>
                )}
            </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

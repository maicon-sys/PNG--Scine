import React from 'react';
import { X, TrendingUp, AlertOctagon, Lightbulb, Shield, Book, CheckCircle } from 'lucide-react';
import { AnalysisGap, DiagnosisResponse, GapSeverity } from '../types';

interface DiagnosisDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosis: DiagnosisResponse;
}

const severityMap: Record<GapSeverity, { text: string; icon: React.ReactNode; color: string }> = {
  A: { text: 'Grave', icon: <AlertOctagon className="w-4 h-4" />, color: 'text-red-600 bg-red-100 border-red-200' },
  B: { text: 'Moderada', icon: <TrendingUp className="w-4 h-4" />, color: 'text-yellow-600 bg-yellow-100 border-yellow-200' },
  C: { text: 'Leve', icon: <Lightbulb className="w-4 h-4" />, color: 'text-blue-600 bg-blue-100 border-blue-200' },
};

const ImprovementTips: React.FC<{ gap: AnalysisGap }> = ({ gap }) => {
    // Generate tips based on gap description keywords
    const getSebraeTip = () => {
        const lowerDesc = gap.description.toLowerCase();
        if (lowerDesc.includes('financeiro') || lowerDesc.includes('planilhas')) {
            return "O SEBRAE exige um plano financeiro detalhado. Construa projeções de DRE, Fluxo de Caixa e Balanço para 5 anos. Use premissas claras para receitas, custos e investimentos, mostrando a viabilidade do negócio.";
        }
        if (lowerDesc.includes('mercado') || lowerDesc.includes('pesquisa')) {
            return "Valide sua ideia de negócio, como preconiza o SEBRAE. Realize pesquisas (ex: Google Forms) para quantificar o tamanho do seu mercado (TAM/SAM/SOM) e a real disposição a pagar dos clientes.";
        }
        if (lowerDesc.includes('equipe') || lowerDesc.includes('governanca')) {
            return "Apresente uma equipe com competências complementares. O SEBRAE valoriza um organograma claro que demonstre quem é responsável por cada área-chave do negócio (operações, marketing, finanças).";
        }
        return "Consulte a metodologia do SEBRAE para estruturar esta seção do plano de negócios, garantindo que todos os pontos essenciais sejam cobertos com profundidade e clareza.";
    };

    const getBrdeTip = () => {
        const lowerDesc = gap.description.toLowerCase();
         if (lowerDesc.includes('financeiro') || lowerDesc.includes('planilhas')) {
            return "O BRDE precisa de garantias sobre a sua capacidade de pagamento. As planilhas devem demonstrar um Índice de Cobertura do Serviço da Dívida (DSCR) superior a 1.3. Aponte claramente os usos e fontes dos recursos do financiamento.";
        }
        if (lowerDesc.includes('mercado') || lowerDesc.includes('pesquisa')) {
            return "Para o BRDE, a pesquisa de mercado reduz o risco do financiamento ao provar que existe demanda real. Apresente dados que justifiquem suas projeções de faturamento e o potencial de crescimento regional.";
        }
        if (lowerDesc.includes('garantias') || lowerDesc.includes('riscos')) {
            return "Seja transparente sobre os riscos do negócio. O BRDE espera um plano de mitigação para cada risco identificado. Detalhe as garantias que podem ser oferecidas, alinhadas às exigências da linha de crédito.";
        }
        return "Alinhe a justificativa do seu projeto com os objetivos estratégicos do BRDE, como inovação, sustentabilidade e desenvolvimento regional. Mostre como o financiamento gerará impacto socioeconômico positivo.";
    };

    return (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-bold text-sm text-green-800 flex items-center gap-2 mb-1"><Book className="w-4 h-4" /> Visão SEBRAE</h4>
                <p className="text-xs text-green-700">{getSebraeTip()}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-bold text-sm text-blue-800 flex items-center gap-2 mb-1"><Shield className="w-4 h-4" /> Visão BRDE</h4>
                <p className="text-xs text-blue-700">{getBrdeTip()}</p>
            </div>
        </div>
    );
}

export const DiagnosisDetailModal: React.FC<DiagnosisDetailModalProps> = ({ isOpen, onClose, diagnosis }) => {
  if (!isOpen) return null;

  const scoreColor = diagnosis.overallReadiness >= 75 ? 'text-green-600' : diagnosis.overallReadiness >= 50 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = diagnosis.overallReadiness >= 75 ? 'bg-green-100' : diagnosis.overallReadiness >= 50 ? 'bg-yellow-100' : 'bg-red-100';

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
            <div className="flex items-start justify-between mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                        <div key={gap.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                           <div className="flex justify-between items-start">
                             <h4 className="font-semibold text-gray-800 text-md mb-1">{gap.description}</h4>
                             <span className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full border ${severityMap[gap.severityLevel].color}`}>
                                {severityMap[gap.severityLevel].icon}
                                {severityMap[gap.severityLevel].text}
                             </span>
                           </div>
                           <p className="text-sm text-gray-600 italic border-l-4 border-gray-200 pl-3 py-1">"{gap.aiFeedback}"</p>
                           <ImprovementTips gap={gap} />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                        <p className="font-semibold">Nenhuma lacuna crítica encontrada!</p>
                        <p className="text-sm">O projeto parece bem estruturado. Continue refinando os detalhes.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
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

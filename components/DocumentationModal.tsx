import React from 'react';
import { X, HelpCircle, ClipboardList, BarChart3, TrendingUp } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <HelpCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Documentação do Diagnóstico</h3>
              <p className="text-xs text-gray-500 font-medium">
                Entenda como a IA analisa seu projeto para gerar a pontuação e a matriz.
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
        <div className="flex-1 overflow-y-auto p-8 bg-white space-y-8">
          
          <div>
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              O Checklist do Analista (IA)
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Ao executar o diagnóstico, a IA não faz uma análise genérica. Ela segue uma rigorosa auditoria de 4 níveis para cada capítulo do seu plano de negócios, simulando a análise de um consultor SEBRAE e de um avaliador de crédito BRDE.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <strong className="text-gray-700">Nível 0 — Existência:</strong>
                <p className="text-xs text-gray-500 mt-1">A IA verifica se os tópicos obrigatórios foram, no mínimo, mencionados no contexto que você forneceu.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <strong className="text-gray-700">Nível 1 — Profundidade (Sebrae):</strong>
                <p className="text-xs text-gray-500 mt-1">Avalia a qualidade e o detalhamento da informação. Ex: Uma análise de concorrência deve ter uma tabela comparativa, não apenas texto.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <strong className="text-gray-700">Nível 2 — Exigência Bancária (BRDE):</strong>
                <p className="text-xs text-gray-500 mt-1">O nível mais crítico. Procura por dados que comprovam a viabilidade financeira, como cálculos de TAM/SAM/SOM com fontes e o indicador DSCR.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <strong className="text-gray-700">Nível 3 — Coerência Interna:</strong>
                <p className="text-xs text-gray-500 mt-1">A IA cruza informações entre capítulos para encontrar inconsistências. Ex: A projeção de receita no Financeiro bate com a meta de assinantes do Marketing?</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Como a Matriz Estratégica é Construída
            </h4>
            <p className="text-sm text-gray-600">
              A Matriz (Canvas + SWOT) é o resultado direto da leitura da IA sobre o seu contexto. O processo é o seguinte:
            </p>
            <ul className="list-decimal list-inside space-y-2 mt-4 text-sm text-gray-600 pl-4">
              <li>A IA lê todo o contexto que você forneceu (anotações e arquivos).</li>
              <li>Ela procura por palavras-chave associadas a cada bloco do Canvas (ex: "cliente", "público-alvo" para Segmentos de Clientes) e do SWOT (ex: "vantagem", "diferencial" para Forças).</li>
              <li>Os trechos mais relevantes são extraídos e inseridos no bloco correspondente da matriz.</li>
              <li>O <strong className="text-gray-800">"Nível de Clareza %"</strong> de cada bloco reflete a quantidade e a qualidade das informações encontradas pela IA para aquele tópico.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Como a Pontuação de Prontidão é Calculada
            </h4>
            <p className="text-sm text-gray-600">
              A pontuação de "Nível de Prontidão" é uma métrica transparente e realista, calculada da seguinte forma:
            </p>
             <ul className="list-decimal list-inside space-y-2 mt-4 text-sm text-gray-600 pl-4">
              <li>A IA utiliza a <strong className="text-gray-800">"Matriz de Exigências"</strong> completa (com todos os critérios dos 4 níveis) como um checklist.</li>
              <li>Ela verifica quantos dos critérios obrigatórios foram atendidos com base no seu contexto.</li>
              <li>A pontuação final é a proporção de critérios atendidos sobre o total. Por isso, um projeto novo, sem documentos que comprovem as informações, começa com uma <strong className="text-gray-800">pontuação baixa (15-25%)</strong>, pois não atende às exigências bancárias (Nível 2).</li>
              <li>Os <strong className="text-gray-800">"Pontos de Melhoria"</strong> são os critérios do checklist que ainda não foram atendidos.</li>
            </ul>
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
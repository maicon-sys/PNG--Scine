import React, { useState } from 'react';
import { Key, Loader2, Info, X } from 'lucide-react';

interface SelectApiKeyModalProps {
  onClose: () => void;
  onApiKeySelected: () => void;
}

export const SelectApiKeyModal: React.FC<SelectApiKeyModalProps> = ({ onClose, onApiKeySelected }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectApiKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      setIsLoading(true);
      try {
        await window.aistudio.openSelectKey();
        // Assume key selection was successful as per guidelines, proceed to app.
        // Race condition: hasSelectedApiKey may not immediately return true.
        onApiKeySelected();
      } catch (error) {
        console.error("Failed to open API key selection dialog:", error);
        alert("Falha ao abrir o diálogo de seleção da API Key. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Ambiente AI Studio não detectado ou `window.aistudio` indisponível. Por favor, certifique-se de que está no ambiente correto ou configure sua API Key via variáveis de ambiente.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">API Key Necessária</h3>
          <p className="text-sm text-gray-600 mt-2">
            Para utilizar os recursos de IA (diagnóstico, geração de conteúdo, imagens), você precisa selecionar uma API Key.
          </p>
        </div>

        <button
          onClick={handleSelectApiKey}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
          {isLoading ? 'Abrindo Seletor...' : 'Selecionar API Key'}
        </button>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>
            É necessário usar uma API Key de um projeto do Google Cloud com faturamento ativado.
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-700 hover:underline ml-1 font-medium"
            >
              Saiba mais sobre faturamento.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
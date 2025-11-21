import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Settings, Plus, Target, Loader2, ImageIcon, AlertCircle, CheckCircle2, Globe, Link } from 'lucide-react';
import { AppContextState, UploadedFile, BusinessGoal, ProjectAsset } from '../types';

interface ContextManagerProps {
  state: AppContextState;
  onUpdate: (newState: Partial<AppContextState>) => void;
}

export const ContextManager: React.FC<ContextManagerProps> = ({ state, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(Array.from(files));
  };

  const readPdfText = async (file: File): Promise<string> => {
    if (!window.pdfjsLib) {
      alert("A biblioteca de leitura de PDF não carregou. Por favor, recarregue a página.");
      throw new Error("PDF library not loaded");
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += `--- Página ${i} ---\n${pageText}\n\n`;
    }
    return fullText;
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    const newFiles: UploadedFile[] = [];
    const newAssets: ProjectAsset[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProcessingStatus(`Processando ${i + 1} de ${files.length}: ${file.name}...`);

      try {
        if (file.type.startsWith('image/')) {
           const base64 = await convertImageToBase64(file);
           const rawBase64 = base64.split(',')[1]; 
           
           newAssets.push({
             id: Math.random().toString(36).substring(7),
             type: 'photo',
             data: rawBase64,
             description: file.name
           });
           
           newFiles.push({
             name: file.name,
             content: `[IMAGEM ANEXADA PELO USUÁRIO: ${file.name}]`,
             type: 'image'
           });

        } else {
           let content = "";
           if (file.type === "application/pdf") {
             content = await readPdfText(file);
           } else {
             content = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string || "");
                reader.readAsText(file);
             });
           }
           newFiles.push({
             name: file.name,
             content: content,
             type: 'text'
           });
        }
      } catch (error) {
        console.error(`Erro ao ler arquivo ${file.name}:`, error);
        alert(`Erro ao ler o arquivo ${file.name}. Verifique o console para detalhes.`);
      }
    }

    onUpdate({ 
      uploadedFiles: [...state.uploadedFiles, ...newFiles],
      assets: [...state.assets, ...newAssets]
    });
    setIsProcessing(false);
    setProcessingStatus('');
  };

  const removeFile = (index: number) => {
    const newFiles = [...state.uploadedFiles];
    newFiles.splice(index, 1);
    onUpdate({ uploadedFiles: newFiles });
  };

  const removeWebSource = (index: number) => {
    const newSources = [...(state.webSources || [])];
    newSources.splice(index, 1);
    onUpdate({ webSources: newSources });
  };

  const fullContext = `
OBJETIVO: ${state.businessGoal}
METODOLOGIA: ${state.methodology}
ANOTAÇÕES MANUAIS:
${state.rawContext}
CONTEÚDO DOS ARQUIVOS:
${state.uploadedFiles.filter(f => f.type === 'text' && !f.isRestored).map(f => `--- ARQUIVO: ${f.name} ---\n${f.content}`).join('\n\n')}
IMAGENS DISPONÍVEIS:
${state.assets.map(a => `- ${a.description} (${a.type})`).join('\n')}
  `;

  const hasRestoredFiles = state.uploadedFiles.some(f => f.isRestored);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      
      <div className="space-y-2">
        <label className="flex items-center text-sm font-semibold text-gray-800 gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          Objetivo do Plano de Negócios
        </label>
        <select
          value={state.businessGoal}
          onChange={(e) => onUpdate({ businessGoal: e.target.value as BusinessGoal })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium"
        >
          <option value={BusinessGoal.GENERAL} className="text-gray-900">Estruturação Geral / Uso Interno</option>
          <option value={BusinessGoal.INVESTORS} className="text-gray-900">Apresentação para Investidores (Equity)</option>
          <option value={BusinessGoal.FINANCING_BRDE} className="text-gray-900">Solicitação de Financiamento BRDE / FSA (Inovação)</option>
        </select>
        {state.businessGoal === BusinessGoal.FINANCING_BRDE && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-900 font-medium">
            <strong>Modo Ativado:</strong> A IA atuará como consultor do BRDE.
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-center text-sm font-semibold text-gray-800 gap-2">
          <Settings className="w-4 h-4 text-blue-600" />
          Metodologia Aplicada
        </label>
        <input
          type="text"
          value={state.methodology}
          onChange={(e) => onUpdate({ methodology: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 font-medium"
          placeholder="Ex: SEBRAE, Canvas..."
        />
      </div>

      <div className="space-y-2">
         <label className="flex items-center text-sm font-semibold text-gray-800 gap-2">
          <Upload className="w-4 h-4 text-blue-600" />
          Arquivos de Projeto (PDFs, Imagens, Textos)
        </label>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer relative ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            processFiles(Array.from(e.dataTransfer.files));
          }}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          {isProcessing ? (
             <div className="flex flex-col items-center justify-center text-blue-600">
               <Loader2 className="w-8 h-8 mb-2 animate-spin" />
               <p className="text-sm font-medium text-gray-900">{processingStatus}</p>
             </div>
          ) : (
            <>
              <input 
                type="file" 
                multiple 
                accept=".pdf,.txt,.md,.csv,.json,.jpg,.jpeg,.png" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Plus className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Arraste PDFs, Textos ou Imagens</p>
                <p className="text-xs mt-1 text-gray-500">O sistema processa imagens e documentos de grande porte.</p>
              </div>
            </>
          )}
        </div>

        {hasRestoredFiles && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                    <strong>Arquivos restaurados:</strong> Alguns arquivos foram restaurados da memória, mas seu conteúdo bruto foi removido para otimizar o sistema. 
                    <br/>As seções já geradas estão salvas. Se precisar gerar <u>novas seções</u> usando esses arquivos, por favor, envie-os novamente.
                </div>
            </div>
        )}

        {state.uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            {state.uploadedFiles.map((file, idx) => (
              <div key={idx} className={`flex items-center justify-between p-2 rounded border text-sm ${file.isGenerated ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-2 overflow-hidden">
                  {file.isGenerated ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : (file.type === 'image' ? <ImageIcon className="w-4 h-4 text-purple-500" /> : <FileText className="w-4 h-4 text-gray-500" />)}
                  <span className={`truncate ${file.isRestored ? 'text-gray-400 italic' : 'text-gray-900'} ${file.isGenerated ? 'font-medium text-green-900' : ''}`}>
                      {file.name} {file.isRestored && '(Conteúdo não carregado)'}
                  </span>
                </div>
                <button onClick={() => removeFile(idx)} className="text-red-500 hover:text-red-700 p-1 disabled:text-gray-400" disabled={file.isGenerated}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-center text-sm font-semibold text-gray-800 gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          Anotações e Ideias Soltas
        </label>
        <textarea
          value={state.rawContext}
          onChange={(e) => onUpdate({ rawContext: e.target.value })}
          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-gray-900"
          placeholder="Cole aqui rascunhos, ideias ou informações importantes..."
        />
      </div>

      {state.webSources && state.webSources.length > 0 && (
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-800 gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Fontes da Web (Coletadas pela IA)
          </label>
          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
            {(state.webSources || []).map((source, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded border text-sm bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Link className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="truncate text-blue-800 hover:underline" title={source.url}>
                    {source.title || new URL(source.url).hostname}
                  </a>
                </div>
                <button onClick={() => removeWebSource(idx)} className="text-red-500 hover:text-red-700 p-1 flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
        <p className="text-xs text-blue-800 font-medium">
          Caracteres consolidados para memória da IA: {fullContext.length.toLocaleString()}
        </p>
      </div>
    </div>
  );
};
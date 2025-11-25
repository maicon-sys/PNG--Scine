import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Trash2, File, Loader2 } from 'lucide-react';
import { AppContextState, UploadedFile, ProjectAsset } from '../types';

interface ContextManagerProps {
  state: AppContextState;
  onUpdate: (updates: Partial<AppContextState>) => void;
}

export const ContextManager: React.FC<ContextManagerProps> = ({ state, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const readPdfText = async (file: File): Promise<string> => {
    if (!window.pdfjsLib) {
      throw new Error("Biblioteca PDF.js não carregada.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `\n--- Página ${i} ---\n${pageText}`;
    }
    return fullText;
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    const newFiles: UploadedFile[] = [];
    const newAssets: ProjectAsset[] = [];

    // Whitelist de tipos de texto seguros
    const isSafeTextFile = (file: File) => {
        const safeTypes = ['text/plain', 'text/markdown', 'text/csv', 'application/json', 'text/x-markdown'];
        const safeExtensions = /\.(txt|md|csv|json)$/i;
        return safeTypes.includes(file.type) || safeExtensions.test(file.name);
    };

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

        } else if (file.type === "application/pdf") {
           try {
             const content = await readPdfText(file);
             newFiles.push({
               name: file.name,
               content: content,
               type: 'text'
             });
           } catch (e) {
             console.error(e);
             alert(`Erro ao ler PDF ${file.name}. Certifique-se de que não está protegido por senha ou que o PDF.js está carregado.`);
           }

        } else if (isSafeTextFile(file)) {
           const content = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string || "");
              reader.readAsText(file);
           });
           newFiles.push({
             name: file.name,
             content: content,
             type: 'text'
           });
        } else {
            // Bloqueia DOCX, XLSX e outros binários não suportados
            alert(`Arquivo não suportado: "${file.name}".\n\nO sistema aceita apenas:\n- PDFs (.pdf)\n- Imagens (.jpg, .png)\n- Texto Puro (.txt, .md, .csv, .json)\n\nPara arquivos Word (.docx) ou Excel (.xlsx), por favor, salve como PDF antes de enviar.`);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = state.uploadedFiles[index];
    const newFiles = state.uploadedFiles.filter((_, i) => i !== index);
    
    // If it was an image, try to remove associated asset
    let newAssets = state.assets;
    if (fileToRemove.type === 'image') {
        newAssets = state.assets.filter(a => a.description !== fileToRemove.name);
    }

    onUpdate({ uploadedFiles: newFiles, assets: newAssets });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" /> Upload de Arquivos
        </h3>
        <p className="text-sm text-slate-500 mb-4">
            Adicione PDFs, textos ou imagens para dar contexto à IA.
        </p>
        
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
        >
            <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.txt,.md,.csv,.json,image/*"
            />
            {isProcessing ? (
                <div className="flex flex-col items-center text-blue-600">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm font-medium">{processingStatus}</span>
                </div>
            ) : (
                <div className="flex flex-col items-center text-slate-500">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Clique para selecionar arquivos</span>
                    <span className="text-xs text-slate-400 mt-1">PDF, TXT, MD, CSV, JSON, PNG, JPG</span>
                </div>
            )}
        </div>
      </div>

      {state.uploadedFiles.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Arquivos Processados ({state.uploadedFiles.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {state.uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 text-sm group">
                        <div className="flex items-center gap-2 overflow-hidden">
                            {file.type === 'image' ? <ImageIcon className="w-4 h-4 text-purple-500 flex-shrink-0" /> : <File className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                            <span className="truncate text-slate-700" title={file.name}>{file.name}</span>
                            {file.isGenerated && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">Gerado</span>}
                        </div>
                        <button onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
          </div>
      )}

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-2">Anotações de Contexto</h3>
        <p className="text-xs text-slate-500 mb-2">Cole informações rápidas ou instruções aqui.</p>
        <textarea
            value={state.rawContext}
            onChange={(e) => onUpdate({ rawContext: e.target.value })}
            className="w-full h-32 p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: O cliente tem orçamento de 50k..."
        />
      </div>
    </div>
  );
};

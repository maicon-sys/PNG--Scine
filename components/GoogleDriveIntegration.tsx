
import React, { useState, useEffect, useRef } from 'react';
import { HardDrive, Check, Loader2, FolderPlus } from 'lucide-react';

interface GoogleDriveIntegrationProps {
  projectName: string;
  currentVersion: number;
  onConnect: (folderName: string, fileId: string) => void;
  onCancel: () => void;
}

export const GoogleDriveIntegration: React.FC<GoogleDriveIntegrationProps> = ({ projectName, currentVersion, onConnect, onCancel }) => {
  const [step, setStep] = useState<'auth' | 'folder' | 'success'>('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(`Projetos SCine`);

  // Ref to track active timeouts
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts when component unmounts
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Helper to register timeouts so they can be cleared
  const safeSetTimeout = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
  };

  const handleAuth = () => {
    setIsLoading(true);
    // Simulate OAuth delay
    safeSetTimeout(() => {
      setIsLoading(false);
      setStep('folder');
    }, 1500);
  };

  const handleConfirmFolder = () => {
    setIsLoading(true);
    
    // Naming convention: [NOME_DO_PROJETO] - Plano de Negócio - Versão [VX]
    const finalFolderName = selectedFolder;

    safeSetTimeout(() => {
      setIsLoading(false);
      setStep('success');
      // Pass fake IDs
      safeSetTimeout(() => {
         onConnect(finalFolderName, `file-id-${Date.now()}`);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500"></div>

        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <HardDrive className="w-6 h-6 text-blue-600" />
          Conectar Google Drive
        </h2>

        {step === 'auth' && (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-6 text-sm">
              Conecte sua conta para que a IA possa criar e atualizar o documento do plano automaticamente na nuvem.
            </p>
            <button
              onClick={handleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition-all shadow-sm"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Drive" className="w-6 h-6" />
              )}
              {isLoading ? 'Autenticando...' : 'Autorizar Acesso ao Drive'}
            </button>
          </div>
        )}

        {step === 'folder' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pasta de Destino</label>
            <div className="flex items-center gap-2 mb-4">
                <input
                type="text"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
            </div>
            
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                <p className="text-xs font-bold text-blue-800 mb-1">ARQUIVO A SER CRIADO:</p>
                <p className="text-sm font-mono text-blue-900 break-all">
                    {projectName} - Plano de Negócio - Versão V{currentVersion}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                    *A IA manterá a estrutura de tópicos (1 a 11) organizada automaticamente neste documento.
                </p>
            </div>

            <button
              onClick={handleConfirmFolder}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
              Criar Documento V{currentVersion}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Conectado com Sucesso!</h3>
            <p className="text-gray-500 mt-2 text-sm">Documento criado e pronto para sincronização.</p>
          </div>
        )}

        {step !== 'success' && (
            <button onClick={onCancel} className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700">
                Cancelar
            </button>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { Plus, Folder, Trash2, Clock, ExternalLink, LogOut, AlertTriangle, Download, Upload } from 'lucide-react';
import { Project, User } from '../types';

interface DashboardProps {
  user: User;
  projects: Project[];
  onCreateProject: (name: string) => void;
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onLogout: () => void;
  onExportProject: (id: string) => void;
  onImportProject: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  projects, 
  onCreateProject, 
  onOpenProject, 
  onDeleteProject,
  onLogout,
  onExportProject,
  onImportProject
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName);
      setNewProjectName('');
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Stratégia AI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold border border-orange-200">
              {user.name.charAt(0)}
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seus Projetos</h1>
            <p className="text-gray-500 mt-1">Gerencie seus planos de negócio e versões.</p>
          </div>
          <div className="flex items-center gap-3">
              <input
                type="file"
                ref={importInputRef}
                className="hidden"
                onChange={onImportProject}
                accept=".json"
              />
              <button
                onClick={() => importInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium shadow-sm transition-all"
              >
                  <Upload className="w-4 h-4" /> Importar Projeto
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all hover:shadow-md"
              >
                <Plus className="w-5 h-5" /> Novo Projeto
              </button>
          </div>
        </div>

        {/* Project Grid */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhum projeto ainda</h3>
            <p className="text-gray-500 mt-1 mb-6">Comece criando seu primeiro plano de negócios com IA.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-orange-600 font-medium hover:text-orange-700 hover:underline"
            >
              Criar projeto agora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Folder className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex items-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onExportProject(project.id); }}
                        className="text-gray-300 hover:text-blue-500 transition-colors p-1"
                        title="Exportar projeto para .json"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setProjectToDelete(project.id); }}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Atualizado em {new Date(project.updatedAt).toLocaleDateString()} às {new Date(project.updatedAt).toLocaleTimeString()}
                  </p>

                  <div className="flex items-center gap-2 mb-6 text-xs text-gray-600">
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <Clock className="w-3 h-3" /> v{project.versions.length + 1}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenProject(project.id)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-700 font-medium py-2 rounded-lg border border-gray-200 hover:border-orange-200 transition-all"
                  >
                    Abrir Editor <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Novo Projeto</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Projeto</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                  placeholder="Ex: SCine - Plano de Expansão"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Excluir projeto?</h3>
              <p className="text-sm text-gray-500 mt-2">
                Esta ação é irreversível. Todo o progresso, versões e arquivos deste plano serão perdidos.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { onDeleteProject(projectToDelete); setProjectToDelete(null); }}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
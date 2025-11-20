
import React from 'react';
import { ValueMatrix } from '../types';
import { AlertTriangle, CheckCircle2, Download, TableProperties } from 'lucide-react';

interface ValueMatrixViewerProps {
  matrix: ValueMatrix;
}

export const ValueMatrixViewer: React.FC<ValueMatrixViewerProps> = ({ matrix }) => {
  
  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(matrix, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "MATRIZ_DE_VALORES_SCINE.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (!matrix || matrix.entries.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
              <TableProperties className="w-12 h-12 mb-3 opacity-20" />
              <p>Nenhuma matriz de dados gerada ainda.</p>
              <p className="text-xs mt-1">Execute o Diagnóstico para processar a Etapa 0.</p>
          </div>
      );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-slate-50">
        <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TableProperties className="w-5 h-5 text-blue-600" /> 
                0. MATRIZ DE DADOS CONSOLIDADA
            </h2>
            <p className="text-sm text-slate-500 mt-1">
                Fonte única de verdade para o plano (Etapa 0). Dados extraídos e consolidados dos arquivos.
            </p>
        </div>
        <button 
            onClick={downloadJson}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
            <Download className="w-4 h-4" /> Download JSON
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-xs border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Item (Grandeza)</th>
              <th className="px-6 py-4">Valor Oficial</th>
              <th className="px-6 py-4">Fontes / Critério</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {matrix.entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                    {entry.status_resolucao === 'consolidado' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3" /> OK
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3" /> Conflito
                        </span>
                    )}
                </td>
                <td className="px-6 py-4 font-medium text-slate-500">{entry.categoria.toUpperCase()}</td>
                <td className="px-6 py-4 text-slate-800 font-semibold">{entry.nome}</td>
                <td className="px-6 py-4 font-mono text-blue-700 font-bold bg-blue-50/50 rounded">
                    {entry.valor} <span className="text-xs text-slate-400 font-normal ml-1">{entry.unidade}</span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 max-w-xs">
                    <div className="mb-1 font-medium text-slate-700">Critério: {entry.criterio_escolha}</div>
                    <ul className="list-disc list-inside space-y-1 opacity-80">
                        {entry.fontes_usadas.map((f, i) => (
                            <li key={i} className="truncate" title={`${f.arquivo} (${f.localizacao})`}>
                                {f.arquivo} <span className="text-slate-400">({f.valor_original})</span>
                            </li>
                        ))}
                    </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

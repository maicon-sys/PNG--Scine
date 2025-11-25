import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Este componente serve como um placeholder para indicar que a antiga "Matriz de Valor" foi deprecada.
 * A funcionalidade foi absorvida e expandida pelo componente StrategicMatrixViewer,
 * que exibe uma visão mais completa do modelo de negócios (Canvas + SWOT).
 */
export const ValueMatrixViewer: React.FC = () => {
  return (
    <div className="p-4 my-4 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800">
      <h3 className="font-bold flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Componente Deprecado
      </h3>
      <p className="text-sm mt-2">
        O componente <strong>ValueMatrixViewer</strong> foi substituído pelo{' '}
        <strong>StrategicMatrixViewer</strong>. A 'Matriz de Valor' foi evoluída
        para a 'Matriz Estratégica' (Canvas + SWOT) para uma análise mais
        completa. Por favor, utilize o componente <code>StrategicMatrixViewer</code> em seu
        lugar.
      </p>
    </div>
  );
};
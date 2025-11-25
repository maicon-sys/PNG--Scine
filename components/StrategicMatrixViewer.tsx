import React, { useState } from 'react';
import { StrategicMatrix, MatrixItem, Severity } from '../types';
import { Download, TableProperties, ChevronDown, CheckCircle, BarChart, Lightbulb, Zap, AlertTriangle, Maximize } from 'lucide-react';

interface StrategicMatrixViewerProps {
  matrix: StrategicMatrix;
  onExpand?: () => void;
  isModalView?: boolean;
}

const SeverityBadge = ({ severity }: { severity: Severity }) => {
    const severityMap = {
        crítico: 'bg-red-100 text-red-800 border-red-200',
        alto: 'bg-orange-100 text-orange-800 border-orange-200',
        moderado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        baixo: 'bg-blue-100 text-blue-800 border-blue-200',
        cosmético: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${severityMap[severity] || 'bg-gray-100'}`}>
            {severity}
        </span>
    );
};

const CanvasBlockDisplay = ({ title, block, icon }: { title: string, block: any, icon: React.ReactNode }) => {
    if (!block || block.clarityLevel === 0) return null;

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <h4 className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700 flex justify-between items-center">
                <span className="flex items-center gap-2">{icon}{title}</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{block.clarityLevel}%</span>
            </h4>
            <div className="p-4 space-y-2">
                <p className="text-xs text-gray-500 italic">{typeof block.description === 'string' ? block.description : JSON.stringify(block.description)}</p>
                 <ul className="space-y-1">
                    {block.items?.map((i: MatrixItem, index: number) => (
                        <li key={index} className="text-xs p-2 bg-white rounded border border-gray-100">
                           <div className="flex justify-between items-start gap-2">
                                <strong className="font-semibold text-gray-800">{typeof i.item === 'string' ? i.item : JSON.stringify(i.item)}:</strong> 
                                <SeverityBadge severity={i.severity} />
                           </div>
                           <p className="mt-1 text-gray-600">{typeof i.description === 'string' ? i.description : JSON.stringify(i.description)}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

const SwotBlockDisplay = ({ title, block, icon }: { title: string, block: any, icon: React.ReactNode }) => {
     if (!block || block.clarityLevel === 0) return null;

     return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <h4 className="px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700 flex justify-between items-center">
                <span className="flex items-center gap-2">{icon}{title}</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{block.clarityLevel}%</span>
            </h4>
            <div className="p-4 space-y-1">
                 <ul className="space-y-2 text-xs text-gray-800">
                    {block.items?.map((i: MatrixItem, index: number) => (
                        <li key={index} className="flex justify-between items-center gap-2">
                            <span>- {typeof i.item === 'string' ? i.item : JSON.stringify(i.item)}</span>
                            <SeverityBadge severity={i.severity} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export const StrategicMatrixViewer: React.FC<StrategicMatrixViewerProps> = ({ matrix, onExpand, isModalView = false }) => {
  const [isOpen, setIsOpen] = useState(true);

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(matrix, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "MATRIZ_ESTRATEGICA_SCINE.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (!matrix || matrix.generatedAt === 0 || !matrix.swot) {
      return (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
              <TableProperties className="w-12 h-12 mb-3 opacity-20" />
              <p>Nenhuma matriz estratégica gerada ou dados incompletos.</p>
              <p className="text-xs mt-1">Execute o Diagnóstico para construir a matriz.</p>
          </div>
      );
  }

  const matrixContent = (
    <div className={`p-4 space-y-4 ${isModalView ? '' : 'bg-slate-50/50'}`}>
        <h3 className="font-semibold text-center text-gray-500 text-sm uppercase">Business Model Canvas</h3>
        <div className={`grid ${isModalView ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
            <CanvasBlockDisplay title="Segmentos de Clientes" block={matrix.customerSegments} icon={<CheckCircle className="w-4 h-4 text-green-600"/>} />
            <CanvasBlockDisplay title="Proposta de Valor" block={matrix.valueProposition} icon={<Lightbulb className="w-4 h-4 text-yellow-600"/>} />
            <CanvasBlockDisplay title="Canais" block={matrix.channels} icon={<Zap className="w-4 h-4 text-blue-600"/>} />
            <CanvasBlockDisplay title="Relacionamento" block={matrix.customerRelationships} icon={<CheckCircle className="w-4 h-4 text-green-600"/>} />
            <CanvasBlockDisplay title="Fontes de Receita" block={matrix.revenueStreams} icon={<BarChart className="w-4 h-4 text-purple-600"/>} />
            <CanvasBlockDisplay title="Estrutura de Custos" block={matrix.costStructure} icon={<AlertTriangle className="w-4 h-4 text-red-600"/>} />
        </div>

         <h3 className="font-semibold text-center text-gray-500 text-sm uppercase pt-4">Análise SWOT</h3>
         <div className="grid grid-cols-2 gap-3">
              <SwotBlockDisplay title="Forças" block={matrix.swot?.strengths} icon={<CheckCircle className="w-4 h-4 text-green-600"/>} />
              <SwotBlockDisplay title="Fraquezas" block={matrix.swot?.weaknesses} icon={<AlertTriangle className="w-4 h-4 text-red-600"/>} />
              <SwotBlockDisplay title="Oportunidades" block={matrix.swot?.opportunities} icon={<Lightbulb className="w-4 h-4 text-yellow-600"/>} />
              <SwotBlockDisplay title="Ameaças" block={matrix.swot?.threats} icon={<Zap className="w-4 h-4 text-blue-600"/>} />
         </div>

        {!isModalView && (
            <div className="pt-2">
                <button 
                onClick={downloadJson}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <Download className="w-3 h-3" /> Download JSON Completo
                </button>
            </div>
        )}
    </div>
  );

  if (isModalView) {
      return matrixContent;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-slate-50">
        <div 
            className="flex-grow cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
        >
            <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <TableProperties className="w-5 h-5 text-blue-600" /> 
                Matriz Estratégica (Canvas + SWOT)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
                Visão consolidada do modelo de negócio.
            </p>
        </div>
        <div className="flex items-center">
            {onExpand && (
                <button onClick={onExpand} className="p-2 text-slate-400 hover:text-blue-600" title="Expandir Visualização">
                    <Maximize className="w-4 h-4" />
                </button>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-400">
                 <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
        </div>
      </div>
      
      {isOpen && matrixContent}
    </div>
  );
};
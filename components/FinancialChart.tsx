import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FinancialYear } from '../types';

interface FinancialChartProps {
  data: FinancialYear[];
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400">Sem dados para exibir</div>;

  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Projeção Financeira (5 Anos)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend />
          <Bar dataKey="revenue" name="Receita" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="profit" name="Lucro Líquido" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
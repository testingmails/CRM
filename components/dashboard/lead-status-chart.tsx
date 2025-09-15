'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface LeadStatusChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = {
  'NEW': '#4682B4',
  'IN_PROGRESS': '#FFD700',
  'CLOSED': '#90EE90'
};

export function LeadStatusChart({ data }: LeadStatusChartProps) {
  const chartData = data.map(item => ({
    ...item,
    name: item.name.replace('_', ' ')
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name.replace(' ', '_') as keyof typeof COLORS] || '#8884d8'} 
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
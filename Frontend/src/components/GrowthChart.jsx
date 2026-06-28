import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

export default function GrowthChart({ chartData }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d75d6d" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#d75d6d" stopOpacity={0.01}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="data" 
            tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            domain={['auto', 'auto']} 
            tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(226, 232, 240, 0.8)', 
              borderRadius: '16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
            }}
            labelStyle={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}
            itemStyle={{ fontSize: 12, fontWeight: 600, color: '#d75d6d' }}
          />
          <Area 
            type="monotone" 
            dataKey="peso" 
            stroke="#d75d6d" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorPeso)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

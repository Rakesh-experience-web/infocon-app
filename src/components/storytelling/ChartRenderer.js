import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter, ComposedChart, Area as ComposedArea
} from 'recharts';

const ChartRenderer = ({ data, config, title, height = 300 }) => {
  const chartData = useMemo(() => {
    if (!data || !config.xAxis || !config.yAxis) return [];
    
    // Process data based on chart type
    switch (config.chartType) {
      case 'bar':
      case 'line':
      case 'area':
        return data.map(row => ({
          [config.xAxis]: row[config.xAxis],
          [config.yAxis]: parseFloat(row[config.yAxis]) || 0
        }));
      
      case 'pie':
        // Group by x-axis and sum y-axis
        const grouped = data.reduce((acc, row) => {
          const key = row[config.xAxis];
          const value = parseFloat(row[config.yAxis]) || 0;
          acc[key] = (acc[key] || 0) + value;
          return acc;
        }, {});
        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
      
      case 'scatter':
        return data.map(row => ({
          x: parseFloat(row[config.xAxis]) || 0,
          y: parseFloat(row[config.yAxis]) || 0
        }));
      
      case 'composed':
        return data.map(row => ({
          [config.xAxis]: row[config.xAxis],
          [config.yAxis]: parseFloat(row[config.yAxis]) || 0,
          area: parseFloat(row[config.yAxis]) || 0
        }));
      
      default:
        return data;
    }
  }, [data, config]);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (config.chartType) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey={config.xAxis} 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey={config.yAxis} 
              fill={config.color || '#3B82F6'}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey={config.xAxis} 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={config.yAxis} 
              stroke={config.color || '#3B82F6'}
              strokeWidth={2}
              dot={{ fill: config.color || '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case 'pie':
        return (
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
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey={config.xAxis} 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={config.yAxis} 
              stroke={config.color || '#3B82F6'}
              fill={config.color || '#3B82F6'}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number" 
              dataKey="x" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Scatter 
              data={chartData} 
              fill={config.color || '#3B82F6'}
            />
          </ScatterChart>
        );

      case 'composed':
        return (
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey={config.xAxis} 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey={config.yAxis} 
              fill={config.color || '#3B82F6'}
              radius={[4, 4, 0, 0]}
            />
            <ComposedArea 
              type="monotone" 
              dataKey="area" 
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.1}
            />
          </ComposedChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>Chart type not supported</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full" style={{ height }}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRenderer;

import React, { useState } from 'react';
import { Download, FileText, BarChart3, ChevronDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import { exportToJSON, exportToCSV, exportToExcel } from '../utils/dataProcessor';
import { toast } from 'react-toastify';

const DataTable = () => {
  const { results } = useData(); // Primarily use results, as this table shows query output.
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Use query results if they exist, otherwise, it will be null.
  const displayData = results;
  const columns = displayData && displayData.length > 0 ? Object.keys(displayData[0]) : [];

  const handleExport = async (format) => {
    setShowExportMenu(false); // Close menu on click
    if (!displayData || displayData.length === 0) {
      return toast.error('No data to export');
    }
    try {
      const exportMap = {
        json: exportToJSON,
        csv: exportToCSV,
        excel: exportToExcel,
      };
      await exportMap[format](displayData);
      toast.success(`Data exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  // If there's no data to display, show a placeholder.
  if (!displayData || displayData.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
        <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No results to display</p>
        <p className="text-sm text-gray-500 mt-1">Run a query to see your data here.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Table Header with Title and Export Button */}
      <div className="flex items-center justify-between mb-4">
        {/* Left side: Title is now handled by the parent component (ExcelPage) */}
      
        {/* Right side: Export Button */}
        <div className="relative ml-auto">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-all duration-300 border border-gray-700 text-sm"
          >
            <Download className="w-4 h-4" />
            Export
            <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-black/80 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-lg z-10 overflow-hidden">
              <button
                onClick={() => handleExport('json')}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-[#00F2A9] hover:bg-gray-800 transition-all duration-300 text-sm"
              >
                As JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-[#00F2A9] hover:bg-gray-800 transition-all duration-300 text-sm"
              >
                As CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-[#00F2A9] hover:bg-gray-800 transition-all duration-300 text-sm"
              >
                As Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden border border-gray-700/50 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50 bg-gray-800/40">
                {columns.map((column) => (
                  <th
                    key={column}
                    className="text-left py-2 px-4 text-[#00F2A9] font-bold tracking-wider"
                  >
                    <div className="truncate" title={column}>
                      {column}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {displayData.slice(0, 100).map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-800/50 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="py-2 px-4 text-gray-300 whitespace-nowrap"
                    >
                      <div 
                        className="truncate" 
                        title={String(row[column] || '')}
                      >
                        {String(row[column] || '')}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayData.length > 100 && (
          <div className="px-4 py-2 bg-gray-800/40 border-t border-gray-700/50">
            <p className="text-gray-500 text-xs text-center">
              Showing first 100 of {displayData.length} total rows
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
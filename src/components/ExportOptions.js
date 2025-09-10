import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Database, Settings, Sparkles, Zap } from 'lucide-react';
import { useData } from '../context/DataContext';
import { exportToJSON, exportToCSV, exportToExcel } from '../utils/dataProcessor';
import { toast } from 'react-toastify';

const ExportOptions = () => {
  const { data, results } = useData();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  const exportData = results || data;

  const handleExport = async (format) => {
    if (!exportData || exportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      switch (format) {
        case 'json':
          await exportToJSON(exportData);
          toast.success('Data exported as JSON successfully');
          break;
        case 'csv':
          await exportToCSV(exportData);
          toast.success('Data exported as CSV successfully');
          break;
        case 'excel':
          await exportToExcel(exportData);
          toast.success('Data exported as Excel successfully');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getExportStats = () => {
    if (!exportData || exportData.length === 0) return null;
    
    const columns = Object.keys(exportData[0]);
    return {
      rows: exportData.length,
      columns: columns.length,
      size: JSON.stringify(exportData).length
    };
  };

  const stats = getExportStats();

  return (
    <div className="glass rounded-xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white tracking-wider flex items-center gap-3" style={{ fontFamily: 'var(--font-unbounded)' }}>
          <Download className="w-6 h-6 text-purple-400" />
          Export Options
        </h2>
        
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </div>
      </div>

      {/* Export Stats */}
      {stats && (
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Export Statistics</span>
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-white">{stats.rows}</div>
              <div className="text-white/60 text-sm">Rows</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-white">{stats.columns}</div>
              <div className="text-white/60 text-sm">Columns</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-white">{(stats.size / 1024).toFixed(1)}KB</div>
              <div className="text-white/60 text-sm">Size</div>
            </div>
          </div>
        </div>
      )}

      {/* Export Format Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          Export Format
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setExportFormat('json')}
            className={`p-4 rounded-lg border transition-all duration-300 transform hover:scale-105 ${
              exportFormat === 'json'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-lg'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">JSON</div>
                <div className="text-xs opacity-70">Structured data format</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setExportFormat('csv')}
            className={`p-4 rounded-lg border transition-all duration-300 transform hover:scale-105 ${
              exportFormat === 'csv'
                ? 'bg-green-500/20 border-green-400 text-green-300 shadow-lg'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">CSV</div>
                <div className="text-xs opacity-70">Comma-separated values</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setExportFormat('excel')}
            className={`p-4 rounded-lg border transition-all duration-300 transform hover:scale-105 ${
              exportFormat === 'excel'
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-lg'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Excel</div>
                <div className="text-xs opacity-70">Spreadsheet format</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => handleExport(exportFormat)}
          disabled={isExporting || !exportData || exportData.length === 0}
          className="flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          <span>
            {isExporting 
              ? `Exporting as ${exportFormat.toUpperCase()}...` 
              : `Export as ${exportFormat.toUpperCase()}`
            }
          </span>
        </button>

        {exportData && exportData.length > 0 && (
          <div className="text-white/60 text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Ready to export {exportData.length} records
          </div>
        )}
      </div>

      {/* Quick Export Buttons */}
      {exportData && exportData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Quick Export
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="flex items-center space-x-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 border border-purple-500/30"
            >
              <FileText className="w-4 h-4" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="flex items-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 border border-green-500/30"
            >
              <FileText className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 border border-blue-500/30"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      )}

      {/* Format Information */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" />
          Format Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="font-medium text-purple-300 mb-1">JSON</div>
            <div className="text-gray-400">Perfect for APIs and data processing. Maintains data structure and types.</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="font-medium text-green-300 mb-1">CSV</div>
            <div className="text-gray-400">Universal format for spreadsheets. Compatible with Excel, Google Sheets, and databases.</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="font-medium text-blue-300 mb-1">Excel</div>
            <div className="text-gray-400">Native Excel format with formatting support. Best for complex data analysis.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;

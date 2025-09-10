import React, { useState, useEffect } from 'react';
import { Upload, Database, Code, BarChart3, FileText, Settings, Bot, Sparkles, ArrowLeft, Brain, Zap, MessageSquare, Download, Search, RefreshCw } from 'lucide-react';
import apiService from '../services/apiService';

const DatasetUploadAPI = ({ onBack }) => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    checkAPIHealth();
    loadDatasets();
  }, []);

  const checkAPIHealth = async () => {
    try {
      const response = await apiService.checkHealth();
      setHealthStatus({ success: true, data: response });
    } catch (error) {
      setHealthStatus({ success: false, error: error.message });
    }
  };

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const response = await apiService.listDatasets();
      setDatasets(response.data.datasets || []);
    } catch (error) {
      console.error('Failed to load datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await apiService.uploadDataset(file, file.name);

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reload datasets
      await loadDatasets();

      // Reset form
      event.target.value = '';
      
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryExecution = async () => {
    if (!selectedDataset || !query.trim()) return;

    try {
      setLoading(true);
      const response = await apiService.executeQuery(selectedDataset.id, query);
      setQueryResults(response.data);
    } catch (error) {
      console.error('Query failed:', error);
      setQueryResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (datasetId, format = 'json') => {
    try {
      await apiService.downloadFile(datasetId, format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          )}
          <h1 className="text-3xl font-bold text-white">
            Dataset API Integration
          </h1>
              </div>

        {/* API Health Status */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-3 h-3 rounded-full ${
              healthStatus?.success ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium text-gray-300">
              {healthStatus?.success ? 'API Gateway Connected' : 'API Gateway Disconnected'}
            </span>
              <button
              onClick={checkAPIHealth}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
              <RefreshCw className="w-3 h-3" />
              Refresh
              </button>
            </div>
              </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Datasets */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Dataset
              </h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                    disabled={loading}
              />
              <label
                htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-300">
                      {loading ? 'Uploading...' : 'Click to upload CSV or Excel file'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Supports .csv, .xlsx, .xls files
                    </span>
              </label>
            </div>

                {uploadProgress > 0 && (
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>

            {/* Available Datasets */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Available Datasets
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                  <p className="text-gray-400">Loading datasets...</p>
                </div>
              ) : datasets.length > 0 ? (
                <div className="space-y-3">
                  {datasets.map(dataset => (
                    <div
                      key={dataset.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedDataset?.id === dataset.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedDataset(dataset)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{dataset.name}</h4>
                          <p className="text-sm text-gray-300">{dataset.rowCount} rows</p>
                          <p className="text-xs text-gray-400">
                            {(dataset.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExport(dataset.id, 'json');
                            }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="Export JSON"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExport(dataset.id, 'csv');
                            }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="Export CSV"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No datasets available. Upload a file to get started.
                </p>
              )}
              
              {/* Quick Start Guide */}
              {datasets.length === 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">🚀 Quick Start Guide</h4>
                  <ol className="text-xs text-blue-200 space-y-2">
                    <li>1. <strong>Upload a CSV file</strong> using the upload area above</li>
                    <li>2. <strong>Select your dataset</strong> from the list once uploaded</li>
                    <li>3. <strong>Click quick commands</strong> to run common SQL queries</li>
                    <li>4. <strong>View results</strong> in the table below</li>
                    <li>5. <strong>Export data</strong> in JSON or CSV format</li>
                  </ol>
                  <div className="mt-3 p-2 bg-blue-500/20 rounded text-xs text-blue-100">
                    <strong>Supported formats:</strong> CSV, Excel (.xlsx, .xls) • <strong>Max size:</strong> 10MB
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Query and Results */}
          <div className="space-y-6">
            {/* SQL Query Editor */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                SQL Query Editor
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Selected Dataset
                  </label>
                  <div className="p-3 bg-white/10 rounded border border-white/20">
                    {selectedDataset ? (
                      <div>
                        <span className="text-white">{selectedDataset.name}</span>
                        <div className="mt-2 text-xs text-gray-400">
                          <p><strong>Table Name:</strong> data</p>
                          <p><strong>Rows:</strong> {selectedDataset.rowCount}</p>
                          <p><strong>Size:</strong> {(selectedDataset.fileSize / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Select a dataset to query</span>
          )}
        </div>
      </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SQL Query
        </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SELECT * FROM data LIMIT 10"
                    className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                    disabled={!selectedDataset}
        />
      </div>

                {/* Default SQL Commands */}
                {selectedDataset && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quick Commands
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <button
                        onClick={() => setQuery('SELECT * FROM data LIMIT 10')}
                        className="px-3 py-2 text-xs bg-green-500/20 border border-green-500/30 text-green-300 rounded hover:bg-green-500/30 transition-colors"
                        title="View first 10 rows"
                      >
                        View Sample Data
                      </button>
                      <button
                        onClick={() => setQuery('SELECT COUNT(*) as total_rows FROM data')}
                        className="px-3 py-2 text-xs bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded hover:bg-blue-500/30 transition-colors"
                        title="Count total rows"
                      >
                        Count Rows
                      </button>
                      <button
                        onClick={() => setQuery('SELECT * FROM data ORDER BY RANDOM() LIMIT 5')}
                        className="px-3 py-2 text-xs bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded hover:bg-purple-500/30 transition-colors"
                        title="Get random sample"
                      >
                        Random Sample
                      </button>
                      <button
                        onClick={() => setQuery('SELECT * FROM data WHERE 1=0 LIMIT 1')}
                        className="px-3 py-2 text-xs bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded hover:bg-orange-500/30 transition-colors"
                        title="Show column names"
                      >
                        Show Columns
                      </button>
                    </div>
                    
                    {/* Advanced Commands */}
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Data Analysis
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <button
                          onClick={() => setQuery('SELECT AVG(CAST(REPLACE(REPLACE(Salary, \'$\', \'\'), \',\', \'\') AS INTEGER)) as avg_salary FROM data WHERE Salary IS NOT NULL')}
                          className="px-3 py-2 text-xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded hover:bg-indigo-500/30 transition-colors"
                          title="Calculate average salary"
                        >
                          Avg Salary
                        </button>
                        <button
                          onClick={() => setQuery('SELECT City, COUNT(*) as count FROM data GROUP BY City ORDER BY count DESC LIMIT 10')}
                          className="px-3 py-2 text-xs bg-pink-500/20 border border-pink-500/30 text-pink-300 rounded hover:bg-pink-500/30 transition-colors"
                          title="Group by city"
                        >
                          Group by City
                        </button>
                        <button
                          onClick={() => setQuery('SELECT * FROM data WHERE Age BETWEEN 25 AND 35 ORDER BY Age')}
                          className="px-3 py-2 text-xs bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded hover:bg-teal-500/30 transition-colors"
                          title="Filter by age range"
                        >
                          Age 25-35
                        </button>
                        <button
                          onClick={() => setQuery('SELECT DISTINCT City FROM data ORDER BY City')}
                          className="px-3 py-2 text-xs bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded hover:bg-yellow-500/30 transition-colors"
                          title="Get unique cities"
                        >
                          Unique Cities
                        </button>
          </div>
          </div>
        </div>
      )}

      <button
                  onClick={handleQueryExecution}
                  disabled={!selectedDataset || !query.trim() || loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Execute Query
      </button>

                {/* Helpful Tips */}
                {selectedDataset && (
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                    <h4 className="text-sm font-medium text-blue-300 mb-2">💡 SQL Tips</h4>
                    <ul className="text-xs text-blue-200 space-y-1">
                      <li>• Use <code className="bg-blue-500/20 px-1 rounded">data</code> as the table name</li>
                      <li>• Click the quick command buttons above for common queries</li>
                      <li>• Use <code className="bg-blue-500/20 px-1 rounded">LIMIT</code> to control result size</li>
                      <li>• Try <code className="bg-blue-500/20 px-1 rounded">SELECT * FROM data LIMIT 5</code> to start</li>
        </ul>
                    
                    <div className="mt-3 pt-3 border-t border-blue-500/20">
                      <h5 className="text-xs font-medium text-blue-300 mb-2">📝 Sample Queries</h5>
                      <div className="space-y-1">
                        <button
                          onClick={() => setQuery('SELECT * FROM data WHERE Age > 30 ORDER BY Age DESC LIMIT 10')}
                          className="block w-full text-left text-xs text-blue-200 hover:text-blue-100 hover:bg-blue-500/20 p-1 rounded"
                        >
                          • Find people over 30, sorted by age
                        </button>
                        <button
                          onClick={() => setQuery('SELECT City, COUNT(*) as count FROM data GROUP BY City HAVING count > 1 ORDER BY count DESC')}
                          className="block w-full text-left text-xs text-blue-200 hover:text-blue-100 hover:bg-blue-500/20 p-1 rounded"
                        >
                          • Cities with multiple people
                        </button>
                        <button
                          onClick={() => setQuery('SELECT Name, Age, City FROM data WHERE Salary > 70000 ORDER BY Salary DESC LIMIT 5')}
                          className="block w-full text-left text-xs text-blue-200 hover:text-blue-100 hover:bg-blue-500/20 p-1 rounded"
                        >
                          • Top 5 highest earners
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Query Results */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Query Results
              </h3>
              
              {queryResults ? (
                <div className="space-y-4">
                  {queryResults.error ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-300">
                      <strong>Error:</strong> {queryResults.error}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm text-gray-300">
                        <span>{queryResults.rows?.length || 0} rows returned</span>
                        <span>Execution time: {queryResults.executionTime || 'N/A'}ms</span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/20">
                              {queryResults.columns?.map((column, index) => (
                                <th key={index} className="text-left p-2 text-gray-300 font-medium">
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResults.rows?.slice(0, 10).map((row, rowIndex) => (
                              <tr key={rowIndex} className="border-b border-white/10">
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="p-2 text-gray-300">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {queryResults.rows?.length > 10 && (
                        <p className="text-xs text-gray-400 text-center">
                          Showing first 10 rows of {queryResults.rows.length} total rows
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Execute a query to see results here
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetUploadAPI;

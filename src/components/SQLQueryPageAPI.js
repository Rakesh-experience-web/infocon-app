import React, { useState, useEffect } from 'react';
import { Play, Save, Download, AlertCircle, CheckCircle, Clock, BarChart3, RefreshCw, Info, Copy, Plus, Upload, Database, Code, ArrowRight, ChevronDown } from 'lucide-react';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';

const SQLQueryPageAPI = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [datasetStats, setDatasetStats] = useState(null);
  const [datasetDetails, setDatasetDetails] = useState(null);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load datasets on component mount
  useEffect(() => {
    checkApiConnection();
    loadDatasets();
  }, []);

  // Ensure datasets are refreshed when API connection status changes
  useEffect(() => {
    loadDatasets();
  }, [isApiConnected]);

  // Check API connection
  const checkApiConnection = async () => {
    try {
      setConnectionStatus('checking');
      await apiService.checkHealth();
      setIsApiConnected(true);
      setConnectionStatus('connected');
    } catch (error) {
      setIsApiConnected(false);
      setConnectionStatus('disconnected');
    }
  };

  // Load datasets from API
  const loadDatasets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (isApiConnected) {
        const response = await apiService.listDatasets();
        setDatasets(response.data.datasets || []);
        if ((response.data.datasets || []).length > 0) {
          const nextSelection = selectedDataset && (response.data.datasets || []).find(d => d.id === selectedDataset.id) || (response.data.datasets || [])[0];
          setSelectedDataset(nextSelection);
          if (nextSelection) {
            loadDatasetDetails(nextSelection.id);
          }
        } else {
          setSelectedDataset(null);
          setDatasetDetails(null);
        }
      } else {
        const localDatasets = JSON.parse(localStorage.getItem('localDatasets') || '[]');
        setDatasets(localDatasets);
        setSelectedDataset(localDatasets.length > 0 ? localDatasets[0] : null);
      }
    } catch (error) {
      setError('Failed to load datasets: ' + error.message);
      toast.error('Failed to load datasets');
    } finally {
      setIsLoading(false);
    }
  };

  // Load dataset details
  const loadDatasetDetails = async (datasetId) => {
    try {
      const response = await apiService.getDatasetDetails(datasetId);
      setDatasetDetails(response.data);
    } catch (error) {
      console.error('Failed to load dataset details:', error);
    }
  };

  // Upload dataset directly here
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isApiConnected) {
      toast.error('API not connected');
      return;
    }
    try {
      setUploading(true);
      setUploadProgress(10);
      // fake progress animation
      const timer = setInterval(() => setUploadProgress(p => Math.min(p + 10, 90)), 120);
      const response = await apiService.uploadDataset(file, file.name);
      clearInterval(timer);
      setUploadProgress(100);
      toast.success('Dataset uploaded');
      // Refresh datasets and select the latest
      await loadDatasets();
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Execute query
  const executeQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }
    if (!selectedDataset) {
      toast.error('Please select a dataset');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.executeQuery(selectedDataset.id, query);
      setResults(response.data);
      
      // Add to history
      setQueryHistory(prev => [
        { query, timestamp: new Date(), results: response.data },
        ...prev.slice(0, 9)
      ]);
      
      toast.success('Query executed successfully');
    } catch (error) {
      setError(error.message);
      toast.error('Query failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Save query
  const saveQuery = () => {
    if (!query.trim()) {
      toast.error('Please enter a query to save');
      return;
    }
    const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
    const newQuery = {
      id: Date.now(),
      query: query,
      timestamp: new Date().toISOString()
    };
    savedQueries.push(newQuery);
    localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
    toast.success('Query saved successfully');
  };

  // Load saved query
  const loadSavedQuery = (savedQuery) => {
    setQuery(savedQuery.query);
  };

  const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0">
        {/* Glowing Light Source - Top Right */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-green-400/30 via-green-500/20 to-transparent rounded-full mix-blend-screen filter blur-3xl"></div>
        
        {/* Diagonal Light Effect */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-green-400/10 via-transparent to-transparent transform rotate-12"></div>
        
        {/* Grid Lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.1) 50%, transparent 100%),
              linear-gradient(0deg, transparent 0%, rgba(34,197,94,0.1) 50%, transparent 100%)
            `,
            backgroundSize: '100px 100px, 100px 100px'
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-green-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-40 w-1 h-1 bg-green-400/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-1.5 h-1.5 bg-green-400/50 rounded-full animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            The Next Frontier of
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent"> Data Intelligence</span>
          </h1>
          <p className="text-gray-400 text-lg">Execute SQL queries on your datasets with AI-powered insights</p>
            </div>

        {/* Connection Status */}
        <div className="mb-6">
          <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
            connectionStatus === 'connected' ? 'bg-green-500/10 border-green-500/30' :
            connectionStatus === 'disconnected' ? 'bg-red-500/10 border-red-500/30' :
            'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            {connectionStatus === 'connected' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : connectionStatus === 'disconnected' ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-400" />
            )}
            <span className="font-medium text-white">
              {connectionStatus === 'connected' ? 'API Connected' :
               connectionStatus === 'disconnected' ? 'API Disconnected' :
               'Checking Connection...'}
            </span>
            <button
              onClick={checkApiConnection}
              className="ml-auto p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Upload Dataset */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="w-4 h-4 text-green-400" />
                <h3 className="font-semibold text-white text-sm">Upload Dataset</h3>
              </div>
              
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={!isApiConnected}
              />
              <label
                htmlFor="file-upload"
                className={`block w-full p-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-300 text-sm ${
                  isApiConnected
                    ? 'border-green-500/30 hover:border-green-500/50 hover:bg-green-500/5 text-gray-300'
                    : 'border-gray-500/30 text-gray-500 cursor-not-allowed'
                }`}
              >
                {uploading ? (
                  <div className="space-y-2">
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div
                        className="bg-green-400 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs">Uploading... {uploadProgress}%</p>
              </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mx-auto mb-1" />
                    <p>Click to upload CSV or Excel file</p>
                  </>
                )}
              </label>
            </div>

            {/* Select Dataset */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-green-400" />
                <h3 className="font-semibold text-white text-sm">Select Dataset</h3>
                <button
                  onClick={loadDatasets}
                  className="ml-auto p-1 hover:bg-white/10 rounded"
                >
                  <RefreshCw className="w-3 h-3 text-gray-400" />
                </button>
              </div>
              
              {datasets.length > 0 ? (
                <select
                  value={selectedDataset?.id || ''}
                  onChange={(e) => {
                    const dataset = datasets.find(d => d.id === e.target.value);
                    setSelectedDataset(dataset);
                    if (dataset) {
                      loadDatasetDetails(dataset.id);
                    }
                  }}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-white text-sm"
                >
                {datasets.map(dataset => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </option>
                ))}
              </select>
              ) : (
                <p className="text-gray-400 text-center py-3 text-sm">
                  Select a dataset...
                </p>
              )}
            </div>

            {/* Dataset Info */}
            {datasetDetails && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-green-400" />
                  <h3 className="font-semibold text-white text-sm">Dataset Info</h3>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Table:</span>
                    <span className="font-mono text-green-400">{datasetDetails.tableName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Columns:</span>
                    <span className="text-white">{datasetDetails.columns?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rows:</span>
                    <span className="text-white">{datasetStats?.rowCount || 'N/A'}</span>
                  </div>
              </div>

                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400 mb-2">Use table name <code className="bg-white/10 px-1 rounded text-green-400">data</code> in queries</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`SELECT * FROM data LIMIT 10;`);
                      toast.success('Sample query copied!');
                    }}
                    className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copy sample query
                  </button>
                  </div>
                </div>
              )}
          </div>

          {/* Right Panel - Query Editor & Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Query Editor */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Code className="w-4 h-4 text-green-400" />
                <h3 className="font-semibold text-white text-sm">SQL Query</h3>
          </div>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM data LIMIT 10;"
                className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-white resize-none"
              />
              
              <div className="flex gap-3 mt-3">
                <button
                  onClick={executeQuery}
                  disabled={!query.trim() || isLoading || !selectedDataset}
                  className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 border border-green-500/30"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Execute Query
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                
                      <button
                  onClick={saveQuery}
                  disabled={!query.trim()}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-white/20"
                      >
                  <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

            {/* Results */}
            {results && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  <h3 className="font-semibold text-white text-sm">Query Results</h3>
                  <span className="text-xs text-gray-400">
                    ({results.length} rows)
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/20">
                        {Object.keys(results[0] || {}).map((column, index) => (
                          <th key={index} className="text-left p-2 text-gray-300 font-semibold">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.slice(0, 8).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-white/10 hover:bg-white/5">
                          {Object.values(row).map((value, colIndex) => (
                            <td key={colIndex} className="p-2 text-gray-400">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {results.length > 8 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Showing first 8 rows of {results.length} total rows
                  </p>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <h3 className="font-semibold text-red-400 text-sm">Query Error</h3>
              </div>
                <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

            {/* Query History */}
            {queryHistory.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold text-white text-sm mb-3">Recent Queries</h3>
                <div className="space-y-2">
                  {queryHistory.slice(0, 3).map((item, index) => (
                    <div key={index} className="p-2 bg-white/10 rounded border border-white/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                    </div>
                      <p className="text-xs font-mono text-gray-300 mb-1">
                        {item.query}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.results.length} rows returned
                      </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SQLQueryPageAPI;

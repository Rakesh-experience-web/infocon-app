import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import apiService from '../services/apiService';

const APIIntegrationGuide = ({ onBack }) => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAPIHealth();
    loadDatasets();
  }, []);

  const checkAPIHealth = async () => {
    try {
      setLoading(true);
      const response = await apiService.checkHealth();
      setHealthStatus({ success: true, data: response });
    } catch (error) {
      setHealthStatus({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadDatasets = async () => {
    try {
      const response = await apiService.listDatasets();
      setDatasets(response.data.datasets);
    } catch (error) {
      console.error('Failed to load datasets:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Back Button */}
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
            API Gateway Integration Guide
          </h1>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-white/10">
          {/* API Health Status */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">API Health Status</h3>
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${
                healthStatus?.success ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-300">
                {loading ? 'Checking...' : 
                 healthStatus?.success ? 'API Gateway is running' : 
                 'API Gateway is not available'}
              </span>
              <button
                onClick={checkAPIHealth}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            {healthStatus?.data && (
              <div className="mt-2 p-3 bg-white/10 rounded text-sm text-gray-300">
                <p><strong className="text-white">Version:</strong> {healthStatus.data.version}</p>
                <p><strong className="text-white">Status:</strong> {healthStatus.data.message}</p>
                <p><strong className="text-white">Timestamp:</strong> {new Date(healthStatus.data.timestamp).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Available Datasets */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Available Datasets</h3>
            {datasets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {datasets.map(dataset => (
                  <div key={dataset.id} className="p-4 border border-white/20 rounded-lg bg-white/5">
                    <h4 className="font-medium text-white">{dataset.name}</h4>
                    <p className="text-sm text-gray-300">{dataset.rowCount} rows</p>
                    <p className="text-xs text-gray-400">
                      {(dataset.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No datasets available. Upload a file to get started.</p>
            )}
          </div>

          {/* Integration Steps */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Integration Steps</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="font-medium text-blue-300 mb-2">1. Start the API Gateway</h4>
                <code className="text-sm bg-blue-500/20 p-2 rounded block text-blue-100">
                  cd server && npm start
                </code>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="font-medium text-green-300 mb-2">2. Configure Environment</h4>
                <p className="text-sm text-green-200 mb-2">
                  Create a <code className="bg-green-500/20 px-1 rounded">.env</code> file in your React app root:
                </p>
                <code className="text-sm bg-green-500/20 p-2 rounded block text-green-100">
                  REACT_APP_API_URL=http://localhost:5000/api
                </code>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="font-medium text-purple-300 mb-2">3. Use API Service</h4>
                <p className="text-sm text-purple-200 mb-2">
                  Import and use the API service in your components:
                </p>
                <code className="text-sm bg-purple-500/20 p-2 rounded block text-purple-100">
                  import apiService from '../services/apiService';
                </code>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <h4 className="font-medium text-orange-300 mb-2">4. Available Methods</h4>
                <ul className="text-sm text-orange-200 space-y-1">
                  <li>• <code className="bg-orange-500/20 px-1 rounded">apiService.uploadDataset(file, name)</code></li>
                  <li>• <code className="bg-orange-500/20 px-1 rounded">apiService.executeQuery(datasetId, query)</code></li>
                  <li>• <code className="bg-orange-500/20 px-1 rounded">apiService.listDatasets()</code></li>
                  <li>• <code className="bg-orange-500/20 px-1 rounded">apiService.exportData(datasetId, format)</code></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Example Usage */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Example Usage</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto border border-gray-700">
              <pre className="text-sm">
{`// Upload a dataset
const handleUpload = async (file, name) => {
  try {
    const response = await apiService.uploadDataset(file, name);
    console.log('Dataset uploaded:', response.data);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Execute a query
const handleQuery = async (datasetId, query) => {
  try {
    const response = await apiService.executeQuery(datasetId, query);
    console.log('Query results:', response.data);
  } catch (error) {
    console.error('Query failed:', error);
  }
};

// Export data
const handleExport = async (datasetId, format = 'json') => {
  try {
    await apiService.downloadFile(datasetId, format);
  } catch (error) {
    console.error('Export failed:', error);
  }
};`}
              </pre>
            </div>
          </div>

          {/* API Endpoints */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Available API Endpoints</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-white/20 rounded-lg bg-white/5">
                <h4 className="font-medium text-white mb-2">Health Check</h4>
                <code className="text-sm bg-white/10 p-1 rounded text-gray-300">GET /health</code>
              </div>
              <div className="p-4 border border-white/20 rounded-lg bg-white/5">
                <h4 className="font-medium text-white mb-2">Upload Dataset</h4>
                <code className="text-sm bg-white/10 p-1 rounded text-gray-300">POST /api/datasets/upload</code>
              </div>
              <div className="p-4 border border-white/20 rounded-lg bg-white/5">
                <h4 className="font-medium text-white mb-2">List Datasets</h4>
                <code className="text-sm bg-white/10 p-1 rounded text-gray-300">GET /api/datasets</code>
              </div>
              <div className="p-4 border border-white/20 rounded-lg bg-white/5">
                <h4 className="font-medium text-white mb-2">Execute Query</h4>
                <code className="text-sm bg-white/10 p-1 rounded text-gray-300">POST /api/datasets/:id/query</code>
              </div>
              <div className="p-4 border border-white/20 rounded-lg bg-white/5">
                <h4 className="font-medium text-white mb-2">Export Data</h4>
                <code className="text-sm bg-white/10 p-1 rounded text-gray-300">GET /api/datasets/:id/export</code>
              </div>
              <div className="p-4 border border-white/20 rounded-lg bg-white/5">
                <h4 className="font-medium text-white mb-2">Get Statistics</h4>
                <code className="text-sm bg-white/10 p-1 rounded text-gray-300">GET /api/datasets/:id/stats</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIIntegrationGuide;

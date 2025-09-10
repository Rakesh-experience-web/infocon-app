import React, { useState } from 'react';
import { Database, Play, Save, Download, ArrowLeft, Code, Eye } from 'lucide-react';
import { useData } from '../context/DataContext';
import { executeQuery } from '../utils/dataProcessor';
import { toast } from 'react-toastify';
import DataTable from './DataTable';

const SQLQueryPage = ({ onBack }) => {
  const { data, dispatch } = useData();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);

  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a SQL query');
      return;
    }

    if (!data || data.length === 0) {
      toast.error('No data available. Please import data first.');
      return;
    }

    setIsLoading(true);
    try {
      const results = await executeQuery(data, query);
      dispatch({
        type: 'SET_RESULTS',
        payload: results
      });
      
      // Add to query history
      setQueryHistory(prev => [
        { query: query, timestamp: new Date(), results: results },
        ...prev.slice(0, 9) // Keep last 10 queries
      ]);
      
      toast.success('Query executed successfully!');
    } catch (error) {
      console.error('Query execution error:', error);
      toast.error(`Query failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuery = () => {
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
    toast.success('Query saved successfully!');
  };

  const loadSavedQuery = (savedQuery) => {
    setQuery(savedQuery.query);
  };

  const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">SQL Query Editor</h1>
          </div>
          <p className="text-gray-600">Write and execute SQL queries on your imported data.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Query Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Query Editor */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">SQL Query</h3>
              </div>
              
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM your_table LIMIT 10;"
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleExecuteQuery}
                  disabled={!query.trim() || isLoading || !data}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Execute Query
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleSaveQuery}
                  disabled={!query.trim()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Data Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Data Status</h3>
              </div>
              
              {data && data.length > 0 ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rows:</span>
                    <span className="font-medium">{data.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Columns:</span>
                    <span className="font-medium">{Object.keys(data[0] || {}).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Ready</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No data loaded</p>
                  <p className="text-gray-400 text-xs">Import data to start querying</p>
                </div>
              )}
            </div>

            {/* Saved Queries */}
            {savedQueries.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Saved Queries</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {savedQueries.slice(-5).reverse().map((savedQuery) => (
                    <div
                      key={savedQuery.id}
                      className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => loadSavedQuery(savedQuery)}
                    >
                      <p className="text-sm font-mono text-gray-700 truncate">
                        {savedQuery.query}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(savedQuery.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2">
            <DataTable />
            
            {/* Query History */}
            {queryHistory.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Queries</h3>
                <div className="space-y-3">
                  {queryHistory.slice(0, 3).map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-mono text-gray-600 mb-1">
                        {item.query}
                      </p>
                      <p className="text-xs text-gray-500">
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

export default SQLQueryPage;

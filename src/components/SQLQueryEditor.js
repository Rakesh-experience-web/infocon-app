import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import { Play, Save, RotateCcw, Code, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { executeQuery } from '../utils/dataProcessor';
import { toast } from 'react-toastify';

// Import necessary Ace Editor modules
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-tomorrow_night_eighties'; // A theme that fits the UI
import 'ace-builds/src-noconflict/ext-language_tools';

const SQLQueryEditor = () => {
  const { data, tableName, dispatch } = useData();
  const [query, setQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryHistory, setQueryHistory] = useState(() => JSON.parse(localStorage.getItem('queryHistory') || '[]'));
  const [suggestions, setSuggestions] = useState([]);

  // Effect to set initial query and generate suggestions when data loads
  useEffect(() => {
    if (data && data.length > 0 && tableName) {
      const columns = Object.keys(data[0]);
      setQuery(`SELECT * FROM ${tableName} LIMIT 10;`);

      const sampleQueries = [
        `SELECT * FROM ${tableName} LIMIT 10`,
        `SELECT COUNT(*) AS total_rows FROM ${tableName}`,
        columns.length > 0 ? `SELECT DISTINCT "${columns[0]}" FROM ${tableName} LIMIT 20` : '',
        columns.length > 1 ? `SELECT "${columns[0]}", COUNT(*) FROM ${tableName} GROUP BY "${columns[0]}"` : ''
      ].filter(Boolean); // Filter out empty strings if no columns

      setSuggestions(sampleQueries);
    } else {
      setQuery(''); // Clear query if no data
    }
  }, [data, tableName]);

  // Effect to save query history to localStorage
  useEffect(() => {
    localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
  }, [queryHistory]);

  const handleExecuteQuery = async () => {
    if (!query.trim()) return toast.error('Query is empty.');
    if (!data) return toast.error('No data uploaded to query.');

    setIsExecuting(true);
    try {
      const results = await executeQuery(data, query, tableName);
      dispatch({ type: 'SET_RESULTS', payload: results });
      
      // Add to history if it's a new query
      if (!queryHistory.includes(query)) {
        setQueryHistory(prev => [query, ...prev.slice(0, 4)]);
      }
      
      toast.success(`Query returned ${results.length} rows.`);
    } catch (error) {
      console.error('Query execution error:', error);
      toast.error(`Query failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveQuery = () => {
    if (!query.trim()) return toast.error('No query to save');
    
    const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
    const newQuery = { id: Date.now(), query };
    
    // Avoid saving duplicates
    if (!savedQueries.some(q => q.query === query)) {
      savedQueries.unshift(newQuery);
      localStorage.setItem('savedQueries', JSON.stringify(savedQueries.slice(0, 10)));
      toast.success('Query saved successfully');
    } else {
      toast.info('This query is already saved.');
    }
  };

  return (
    <div className={`bg-black/30 border border-gray-700/50 rounded-lg p-6 space-y-6 ${!data ? 'opacity-50' : ''}`}>
      <div>
        <h3 className="font-semibold text-white text-lg flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-[#00F2A9]" />
          SQL Editor
        </h3>
        <div className="border border-gray-600 rounded-lg overflow-hidden">
          <AceEditor
            mode="sql"
            theme="tomorrow_night_eighties"
            value={query}
            onChange={setQuery}
            name="sql-editor"
            editorProps={{ $blockScrolling: true }}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              fontSize: 14,
              showLineNumbers: true,
              tabSize: 2,
            }}
            width="100%"
            height="180px"
            style={{ backgroundColor: '#121212' }} // Darker background for editor
            readOnly={!data || isExecuting}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleExecuteQuery}
          disabled={isExecuting || !data}
          className="flex-grow flex items-center justify-center gap-2 px-4 py-3 bg-[#00F2A9] text-black font-bold rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_15px_rgba(0,242,169,0.3)]"
        >
          {isExecuting ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
          <span>{isExecuting ? 'Executing...' : 'Execute Query'}</span>
        </button>
        <button
          onClick={handleSaveQuery}
          disabled={!query.trim() || !data}
          className="px-4 py-3 bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-all duration-300 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700/50">
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-[#00F2A9]" />
             Suggestions
          </h4>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setQuery(s)}
                disabled={!data}
                className="w-full text-left p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-md transition-colors duration-200"
              >
                <code className="text-xs text-gray-400 font-mono truncate">{s}</code>
              </button>
            ))}
          </div>
        </div>
        <div>
           <h4 className="font-semibold text-white mb-3 text-sm flex items-center gap-2">
             <Clock className="w-4 h-4 text-[#00F2A9]" />
             History
          </h4>
          <div className="space-y-2">
            {queryHistory.length > 0 ? queryHistory.map((h, i) => (
              <button
                key={i}
                onClick={() => setQuery(h)}
                className="w-full text-left p-2 bg-gray-800/50 hover:bg-gray-700/80 rounded-md transition-colors duration-200"
              >
                <code className="text-xs text-gray-400 font-mono truncate">{h}</code>
              </button>
            )) : <p className="text-xs text-gray-500 italic">Your recent queries will appear here.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SQLQueryEditor;
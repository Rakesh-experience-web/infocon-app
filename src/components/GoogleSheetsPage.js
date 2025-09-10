import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Download, Eye, ArrowLeft, Database, Code, Play, Save, BarChart3, Table, Settings, FileText, Sparkles, Zap } from 'lucide-react';
import { useData } from '../context/DataContext';
import { GoogleSheetsService } from '../services/googleSheetsService';
import { executeQuery } from '../utils/dataProcessor';
import { toast } from 'react-toastify';
import DataTable from './DataTable';

// A reusable background component for consistent styling
const Background = ({ children }) => (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-blue-950 text-gray-300 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10">{children}</div>
        <style jsx global>{`
      .bg-grid-pattern {
        background-image:
          linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
        background-size: 40px 40px;
      }
    `}</style>
    </div>
);

const GoogleSheetsPage = ({ onBack }) => {
    const { dispatch } = useData();
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [sheetName, setSheetName] = useState('Sheet1');
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [query, setQuery] = useState('');
    const [queryHistory, setQueryHistory] = useState([]);
    const [isExecutingQuery, setIsExecutingQuery] = useState(false);

    const handleConnect = async () => {
        if (!spreadsheetId.trim()) {
            toast.error('Please enter a Spreadsheet ID');
            return;
        }
        setIsLoading(true);
        try {
            const sheetsService = new GoogleSheetsService();
            const sheetData = await sheetsService.fetchSheetData(spreadsheetId, sheetName);
            if (sheetData && sheetData.length > 0) {
                setData(sheetData);
                dispatch({ type: 'SET_DATA', payload: { data: sheetData, columns: Object.keys(sheetData[0]), tableName: sheetName } });
                dispatch({ type: 'SET_DATA_SOURCE', payload: 'google-sheets' });
                dispatch({ type: 'SET_SPREADSHEET_INFO', payload: { spreadsheetId, sheetName } });
                toast.success('Google Sheets data loaded successfully!');
            } else {
                toast.error('No data found in the specified sheet');
            }
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            toast.error('Failed to load Google Sheets data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExecuteQuery = async () => {
        if (!query.trim()) return toast.error('Please enter a SQL query');
        if (!data || data.length === 0) return toast.error('No data available to query.');
        setIsExecutingQuery(true);
        try {
            const results = await executeQuery(data, query);
            dispatch({ type: 'SET_RESULTS', payload: results });
            setQueryHistory(prev => [{ query, timestamp: new Date(), results }, ...prev.slice(0, 9)]);
            toast.success('Query executed successfully!');
        } catch (error) {
            console.error('Query execution error:', error);
            toast.error(`Query failed: ${error.message}`);
        } finally {
            setIsExecutingQuery(false);
        }
    };

    const handleSaveQuery = () => {
        if (!query.trim()) return toast.error('Please enter a query to save');
        const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
        savedQueries.push({ id: Date.now(), query, timestamp: new Date().toISOString() });
        localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
        toast.success('Query saved successfully!');
    };

    const loadSavedQuery = (savedQuery) => setQuery(savedQuery.query);
    const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');

    return (
        <Background>
            {/* Header */}
            <div className="sticky top-0 z-20 bg-black/50 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={onBack} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                            </button>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-white uppercase" style={{ fontFamily: 'Unbounded, Arial, sans-serif' }}>INFOCON</h1>
                                <span className="text-lg text-gray-300 font-medium">Google Sheets Analyzer</span>
                            </div>
                        </div>
                        {data && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10"><Database className="w-4 h-4 text-emerald-400" /><span className="text-sm font-medium text-gray-300">{data.length} rows</span></div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10"><FileSpreadsheet className="w-4 h-4 text-purple-400" /><span className="text-sm font-medium text-gray-300">{Object.keys(data[0] || {}).length} columns</span></div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10"><Settings className="w-4 h-4 text-blue-400" /><span className="text-sm font-medium text-gray-300">{sheetName}</span></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Connection Panel */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10">
                            <div className="flex items-center gap-2 mb-4">
                                <Database className="w-5 h-5 text-purple-400" />
                                <h3 className="font-semibold text-white">Google Sheets Connection</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Spreadsheet ID</label>
                                    <input type="text" value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)} placeholder="Enter Google Sheets ID" className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-white" />
                                    <p className="text-xs text-gray-500 mt-1">Found in the URL: .../d/[ID]/edit</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Sheet Name</label>
                                    <input type="text" value={sheetName} onChange={(e) => setSheetName(e.target.value)} placeholder="Sheet1" className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-white" />
                                </div>
                                <button onClick={handleConnect} disabled={!spreadsheetId.trim() || isLoading} className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                                    {isLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Connecting...</> : <><Database className="w-4 h-4" />Connect to Sheets</>}
                                </button>
                            </div>
                            {data && <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20"><div className="flex items-center gap-2 text-emerald-300"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div><span className="text-sm font-medium">Connected</span></div><p className="text-sm text-emerald-400 mt-1">{data.length} rows loaded from {sheetName}</p></div>}
                        </div>
                        {data && (
                             <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <h4 className="font-medium text-white mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400" />Quick Templates</h4>
                                <div className="space-y-2">
                                    <button onClick={() => setQuery(`SELECT * FROM ${sheetName} LIMIT 10;`)} className="w-full text-left p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 text-xs font-mono">SELECT * FROM table LIMIT 10;</button>
                                    <button onClick={() => setQuery(`SELECT COUNT(*) as total_rows FROM ${sheetName};`)} className="w-full text-left p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 text-xs font-mono">SELECT COUNT(*) FROM table;</button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Query Editor and Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {data && (
                            <>
                                <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2"><Code className="w-5 h-5 text-purple-400" /><h3 className="font-semibold text-white">SQL Query Editor</h3></div>
                                        <code className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-mono">{sheetName}</code>
                                    </div>
                                    <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`SELECT * FROM ${sheetName} LIMIT 10;`} className="w-full h-32 p-3 bg-black/40 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono text-sm text-white resize-none" />
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={handleExecuteQuery} disabled={!query.trim() || isExecutingQuery} className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                                            {isExecutingQuery ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Executing...</> : <><Play className="w-4 h-4" />Execute Query</>}
                                        </button>
                                        <button onClick={handleSaveQuery} disabled={!query.trim()} className="px-4 py-2 bg-white/5 text-white rounded-md hover:bg-white/10 disabled:opacity-50 border border-white/10"><Save className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10">
                                    <div className="p-6 border-b border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-400" /><h3 className="font-semibold text-white">Query Results</h3></div>
                                            {queryHistory.length > 0 && <div className="text-sm text-gray-400">Last query: {queryHistory[0]?.timestamp.toLocaleTimeString()}</div>}
                                        </div>
                                    </div>
                                    <div className="p-6"><DataTable /></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Background>
    );
};

export default GoogleSheetsPage;
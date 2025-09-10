import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, ArrowLeft, Database, Code, Play, Save, BarChart3, Table, Eye, FileText, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';
import { processExcelFile, processCSVFile, executeQuery, testExcelProcessing, validateExcelFile } from '../utils/dataProcessor';
import { toast } from 'react-toastify';
import DataTable from './DataTable';

// A reusable background component for consistent styling
const Background = ({ children }) => (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-blue-950 text-gray-300 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10">{children}</div>
    </div>
);


const ExcelPage = ({ onBack }) => {
    const { dispatch } = useData();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [query, setQuery] = useState('');
    const [queryHistory, setQueryHistory] = useState([]);
    const [isExecutingQuery, setIsExecutingQuery] = useState(false);
    const [activeTab, setActiveTab] = useState('upload'); // upload, query, data

    const getTableName = (fileName) => {
        if (!fileName) return 'data_table';
        return fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_');
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) {
            toast.error('No files selected');
            return;
        }
        
        const file = acceptedFiles[0];
        setUploadedFile(file);
        setIsLoading(true);
        
        try {
            // Validate file type
            const validExtensions = ['.csv', '.xlsx', '.xls', '.xlsm', '.xltx', '.xlt'];
            const fileExt = file.name.split('.').pop().toLowerCase();
            if (!validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
                throw new Error('Invalid file type. Please upload a CSV or Excel file.');
            }
            
            // For Excel files, validate before processing
            if (!file.name.endsWith('.csv')) {
                const validation = await validateExcelFile(file);
                if (!validation.isValid) {
                    throw new Error(validation.message || 'Invalid Excel file');
                }
                
                const testResult = await testExcelProcessing(file);
                if (!testResult.success) {
                    throw new Error(testResult.error || 'Failed to process Excel file');
                }
            }
            
            let processedData;
            if (file.name.endsWith('.csv')) {
                const result = await processCSVFile(file);
                if (!result || !result.data || result.data.length === 0) {
                    throw new Error('No valid data found in CSV file');
                }
                processedData = result.data;
            } else {
                const result = await processExcelFile(file);
                if (!result || !result.data || result.data.length === 0) {
                    throw new Error('No valid data found in Excel file');
                }
                processedData = result.data;
            }
            if (processedData && processedData.length > 0) {
                setData(processedData);
                const cleanTableName = getTableName(file.name);
                dispatch({
                    type: 'SET_DATA',
                    payload: { data: processedData, columns: Object.keys(processedData[0]), tableName: cleanTableName }
                });
                dispatch({ type: 'SET_DATA_SOURCE', payload: file.name.endsWith('.csv') ? 'csv' : 'excel' });
                toast.success('File processed successfully!');
                setActiveTab('query');
            } else {
                toast.error('No data found in the file');
            }
        } catch (error) {
            console.error('Error processing file:', error);
            toast.error(`Failed to process file: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.ms-excel.sheet.macroEnabled.12': ['.xlsm'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.template': ['.xltx'],
            'application/vnd.ms-excel.template': ['.xlt']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false,
        disabled: isLoading,
        onDropRejected: (fileRejections) => {
            const { errors } = fileRejections[0];
            let errorMessage = 'Error uploading file: ';
            if (errors[0].code === 'file-too-large') {
                errorMessage += 'File is too large. Maximum size is 10MB.';
            } else if (errors[0].code === 'file-invalid-type') {
                errorMessage += 'Invalid file type. Please upload a CSV or Excel file.';
            } else {
                errorMessage += errors[0].message;
            }
            toast.error(errorMessage);
        }
    });

    const handleExecuteQuery = async () => {
        if (!query.trim()) return toast.error('Please enter a SQL query');
        if (!data || data.length === 0) return toast.error('No data available to query.');
        setIsExecutingQuery(true);
        try {
            const tableName = getTableName(uploadedFile?.name);
            const results = await executeQuery(data, query, tableName);
            dispatch({ type: 'SET_RESULTS', payload: results });
            setQueryHistory(prev => [{ query: query, timestamp: new Date(), results: results }, ...prev.slice(0, 9)]);
            toast.success('Query executed successfully!');
            setActiveTab('data');
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
        const newQuery = { id: Date.now(), query: query, timestamp: new Date().toISOString() };
        savedQueries.push(newQuery);
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
                                <h1 className="text-2xl font-bold text-white uppercase" style={{ fontFamily: 'Unbounded, Arial, sans-serif', letterSpacing: '0.05em' }}>INFOCON</h1>
                                <span className="text-lg text-gray-300 font-medium">Excel & CSV Analyzer</span>
                            </div>
                        </div>
                        {data && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                    <Database className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm font-medium text-gray-300">{data.length} rows</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                    <Table className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-medium text-gray-300">{Object.keys(data[0] || {}).length} columns</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-medium text-gray-300">{getTableName(uploadedFile?.name)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center gap-1 mb-6 bg-black/30 rounded-lg p-1 border border-white/10">
                    <button onClick={() => setActiveTab('upload')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === 'upload' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
                        <Upload className="w-4 h-4" /> Upload
                    </button>
                    <button onClick={() => setActiveTab('query')} disabled={!data} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === 'query' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' : !data ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
                        <Code className="w-4 h-4" /> Query
                    </button>
                    <button onClick={() => setActiveTab('data')} disabled={!data} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === 'data' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' : !data ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
                        <BarChart3 className="w-4 h-4" /> Results
                    </button>
                </div>

                <div className="space-y-6">
                    {activeTab === 'upload' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Upload className="w-5 h-5 text-emerald-400" />
                                        <h3 className="font-semibold text-white">Upload File</h3>
                                    </div>
                                    <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/20 hover:border-white/40'}`}>
                                        <input {...getInputProps()} />
                                        <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                        {isDragActive ? <p className="text-emerald-400">Drop file here...</p> : <div><p className="text-gray-300 mb-2">Drag & drop file, or click to select</p><p className="text-sm text-gray-500">Supports .xlsx, .xls, .csv</p></div>}
                                    </div>
                                    {isLoading && <div className="mt-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20"><div className="flex items-center gap-2 text-cyan-300"><div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin"></div><span className="font-medium">Processing file...</span></div></div>}
                                    {uploadedFile && !isLoading && <div className="mt-4 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20"><div className="flex items-center gap-2 text-emerald-300"><FileSpreadsheet className="w-4 h-4" /><span className="font-medium">{uploadedFile.name}</span></div>{data && <p className="text-sm text-emerald-400 mt-1">{data.length} rows loaded.</p>}</div>}
                                </div>
                            </div>
                            <div className="space-y-4">
                                {data && (
                                    <>
                                        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                            <h4 className="font-medium text-white mb-3 flex items-center gap-2"><Database className="w-4 h-4 text-emerald-400" />File Information</h4>
                                            <div className="space-y-2 text-sm text-gray-300">
                                                <div className="flex justify-between"><span>Rows:</span><span className="font-medium text-white">{data.length}</span></div>
                                                <div className="flex justify-between"><span>Columns:</span><span className="font-medium text-white">{Object.keys(data[0] || {}).length}</span></div>
                                                <div className="pt-2 border-t border-white/10"><div className="text-xs text-gray-400 mb-1">Table Name:</div><code className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-mono">{getTableName(uploadedFile?.name)}</code></div>
                                            </div>
                                        </div>
                                        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                            <h4 className="font-medium text-white mb-3 flex items-center gap-2"><Table className="w-4 h-4 text-purple-400" />Columns</h4>
                                            <div className="space-y-1 max-h-48 overflow-y-auto">{Object.keys(data[0] || {}).map((c, i) => <div key={i} className="flex justify-between text-sm"><span className="text-gray-300 font-mono truncate">{c}</span></div>)}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'query' && data && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div className="bg-black/30 rounded-xl p-6 border border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2"><Code className="w-5 h-5 text-purple-400" /><h3 className="font-semibold text-white">SQL Query Editor</h3></div>
                                        <code className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-mono">{getTableName(uploadedFile?.name)}</code>
                                    </div>
                                    <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`SELECT * FROM ${getTableName(uploadedFile?.name)} LIMIT 10;`} className="w-full h-32 p-3 bg-black/40 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono text-sm text-white" />
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={handleExecuteQuery} disabled={!query.trim() || isExecutingQuery} className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                                            {isExecutingQuery ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Executing...</> : <><Play className="w-4 h-4" />Execute Query</>}
                                        </button>
                                        <button onClick={handleSaveQuery} disabled={!query.trim()} className="px-4 py-2 bg-white/5 text-white rounded-md hover:bg-white/10 disabled:opacity-50 border border-white/10"><Save className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                    <h4 className="font-medium text-white mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400" />Quick Templates</h4>
                                    <div className="space-y-2">
                                        <button onClick={() => setQuery(`SELECT * FROM ${getTableName(uploadedFile?.name)} LIMIT 10;`)} className="w-full text-left p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 text-xs font-mono text-gray-300">SELECT * FROM table LIMIT 10;</button>
                                        <button onClick={() => setQuery(`SELECT COUNT(*) as total_rows FROM ${getTableName(uploadedFile?.name)};`)} className="w-full text-left p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 text-xs font-mono text-gray-300">SELECT COUNT(*) FROM table;</button>
                                    </div>
                                </div>
                                {savedQueries.length > 0 && <div className="bg-black/30 rounded-xl p-4 border border-white/10"><h4 className="font-medium text-white mb-3 flex items-center gap-2"><Save className="w-4 h-4 text-emerald-400" />Saved Queries</h4><div className="space-y-2 max-h-32 overflow-y-auto">{savedQueries.slice(-3).reverse().map(sq => <div key={sq.id} className="p-2 bg-white/5 rounded cursor-pointer hover:bg-white/10" onClick={() => loadSavedQuery(sq)}><p className="text-xs font-mono text-gray-300 truncate">{sq.query}</p></div>)}</div></div>}
                            </div>
                        </div>
                    )}
                    {activeTab === 'data' && (
                        <div className="bg-black/30 rounded-xl border border-white/10">
                            <div className="p-6 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-400" /><h3 className="font-semibold text-white">Query Results</h3></div>
                                    {queryHistory.length > 0 && <div className="text-sm text-gray-400">Last query: {queryHistory[0]?.timestamp.toLocaleTimeString()}</div>}
                                </div>
                            </div>
                            <div className="p-6"><DataTable /></div>
                        </div>
                    )}
                </div>
            </div>
        </Background>
    );
};

export default ExcelPage;
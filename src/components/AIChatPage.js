import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'react-toastify';
import { Upload, Code, FileText, RefreshCw, Database, BarChart3, ChevronRight } from 'lucide-react';
import { executeQuery } from '../utils/dataProcessor';

// For the Unbounded font, ensure this is in your public/index.html:
// <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700&display=swap" rel="stylesheet">

// The Background component has been updated with the new font and gradient effect.
const Background = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#0D0D0D] text-gray-300" style={{ fontFamily: "'Unbounded', sans-serif" }}>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,242,169,0.1),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const AIChatPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dataFrame, setDataFrame] = useState(null);
  const [tableName, setTableName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // This function simulates the data processing utility
  const processFileLocally = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const rows = text.split('\n').filter(row => row.trim() !== '');
          if (rows.length < 2) {
            reject(new Error("CSV file must have a header and at least one data row."));
            return;
          }
          const header = rows[0].split(',').map(h => h.trim());
          const data = rows.slice(1).map(row => {
            const values = row.split(',');
            let rowData = {};
            header.forEach((h, i) => {
              rowData[h] = values[i] ? values[i].trim() : '';
            });
            return rowData;
          });
          resolve({ data });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const processFile = async (file) => {
    try {
      setIsLoading(true);
      // Using a simplified local processor as the utility file isn't available.
      // Replace with your dynamic import if needed.
      const result = await processFileLocally(file);
      const data = result.data;

      const cleanData = data.filter(row => Object.values(row).some(val => val !== null && val !== ''));
      if (cleanData.length === 0) throw new Error('No valid data found in file');
      
      setDataFrame(cleanData);
      const cleanTableName = file.name.replace(/[^a-zA-Z0-9_]/g, '').replace(/\.[^/.]+$/, '') || 'data_table';
      setTableName(cleanTableName);
      toast.success('File loaded successfully!');
    } catch (error) {
      console.error('File processing error:', error);
      toast.error(`Failed to load file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      processFile(file);
      setSqlQuery('');
      setQueryResult(null);
      setUserQuestion('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    multiple: false
  });

  const generateAndExecuteSQL = async () => {
    if (!apiKey) {
        toast.error('API Key is required to generate SQL.');
        return;
    }
    if (!dataFrame || dataFrame.length === 0) {
        toast.error('Please upload a dataset first.');
        return;
    }
    if (!userQuestion) {
        toast.error('Please ask a question to generate SQL.');
        return;
    }

    setIsLoading(true);
    setSqlQuery('');
    setQueryResult(null);

    try {
        // Generate SQL using AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const columns = Object.keys(dataFrame[0] || {});
        const columnsInfo = columns.map(col => `\`${col}\``).join(', ');
        const sampleData = dataFrame.slice(0, 2).map(row => JSON.stringify(row)).join('\n');

        const prompt = `
          You are a SQL expert. Based on the table schema and sample data, generate a standard SQL query to answer the user's question.
          Table Name: ${tableName}
          Columns: ${columnsInfo}
          Sample Data:
          ${sampleData}
          
          User Question: "${userQuestion}"

          Rules:
          1. ONLY return a valid, single SQL query.
          2. Do not include any explanations, markdown formatting, or introductory text.
          3. Use the exact column names provided.
          4. For questions about "how many" or "count", use COUNT(*).
          
          SQL Query:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let generatedSQL = response.text().trim();

        // Clean up the response to ensure it's just SQL
        generatedSQL = generatedSQL.replace(/```sql/g, '').replace(/```/g, '').trim();
        setSqlQuery(generatedSQL);
        
        // Execute the generated SQL using SQL.js
        try {
            const results = await executeQuery(dataFrame, generatedSQL, tableName);
            setQueryResult(Array.isArray(results) ? results : [results]);
            toast.success('Query executed successfully!');
        } catch (sqlError) {
            console.error('SQL execution error:', sqlError);
            toast.error(`SQL Error: ${sqlError.message}`);
            setQueryResult([]);
        }

    } catch (error) {
        console.error('AI generation error:', error);
        toast.error(`Failed to generate SQL: ${error.message}`);
        setSqlQuery("");
        setQueryResult([]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Background>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">The Next Frontier of <span className="text-[#00F2A9]">Data Intelligence</span></h1>
          <p className="text-gray-400 mt-2">Execute SQL queries on your datasets with AI-powered insights.</p>
        </header>

        {/* API Status Bar */}
        <div className={`flex items-center justify-between p-4 rounded-lg border mb-8 ${apiKey ? 'bg-green-900/50 border-green-500/30' : 'bg-red-900/50 border-red-500/30'}`}>
            <div className='flex items-center gap-4'>
                <span className={`font-semibold ${apiKey ? 'text-green-400' : 'text-red-400'}`}>
                    {apiKey ? 'API Connected' : 'API Disconnected'}
                </span>
                {!apiKey && (
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Google Gemini API key here to connect"
                        className="w-full md:w-96 px-3 py-1 bg-black/30 border border-red-500/50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 text-white placeholder-gray-500 text-sm"
                    />
                )}
            </div>
            <RefreshCw className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-transform duration-300 hover:rotate-90" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-black/30 border border-gray-700/50 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-4 text-lg">Upload Dataset</h3>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-[#00F2A9] bg-[#00F2A9]/10' : 'border-gray-600 hover:border-gray-400'}`}>
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-300">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-500 mt-1">CSV or XLSX file</p>
              </div>
              {uploadedFile && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 text-green-400">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium text-sm">{uploadedFile.name}</span>
                    </div>
                </div>
              )}
            </div>
            <div className="bg-black/30 border border-gray-700/50 rounded-lg p-6 opacity-50">
                <h3 className="font-semibold text-white mb-4 text-lg">Select Dataset</h3>
                <div className="border border-gray-600 rounded-lg p-4 text-center">
                    <p className="text-gray-500 text-sm">Select a dataset...</p>
                </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black/30 border border-gray-700/50 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-1 text-lg">Ask a question about your data</h3>
                <p className="text-sm text-gray-400 mb-4">Our AI will convert your question into a runnable SQL query.</p>
                <textarea
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="e.g., How many rows are in the dataset?"
                    className="w-full h-24 p-3 bg-gray-900/70 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00F2A9] resize-none text-white placeholder-gray-500"
                    disabled={!dataFrame}
                />
            </div>

            <div className="bg-black/30 border border-gray-700/50 rounded-lg p-6">
                <div className='flex items-center justify-between'>
                    <h3 className="font-semibold text-white mb-4 text-lg flex items-center gap-2">
                        <Code className="w-5 h-5 text-[#00F2A9]" />
                        Generated SQL Query
                    </h3>
                    {sqlQuery && <button onClick={() => navigator.clipboard.writeText(sqlQuery).then(() => toast.success('Query copied!'))} className="text-xs text-gray-400 hover:text-white">Copy</button>}
                </div>
                <div className="bg-gray-900/70 text-[#00F2A9] p-4 rounded-lg font-mono text-sm overflow-x-auto min-h-[100px] border border-gray-600">
                    {isLoading && !sqlQuery ? 'Generating query...' : sqlQuery || <span className="text-gray-500">Your generated SQL will appear here...</span>}
                </div>
            </div>

            <button
                onClick={generateAndExecuteSQL}
                disabled={isLoading || !dataFrame || !userQuestion || !apiKey}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00F2A9] text-black font-bold rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_15px_rgba(0,242,169,0.5)]"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
                       <span>Generate & Execute Query</span>
                       <ChevronRight className="w-5 h-5" />
                    </>
                )}
            </button>
          </div>
        </div>

        {/* Query Result Section */}
        {queryResult && (
          <div className="mt-10 bg-black/30 border border-gray-700/50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-[#00F2A9]" />
              <h3 className="font-semibold text-white text-lg">Query Result</h3>
              <span className="text-sm text-gray-400">({queryResult.length} rows shown)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    {Object.keys(queryResult[0] || {}).map((col, index) => (
                      <th key={index} className="px-4 py-2 text-left text-sm font-bold text-[#00F2A9]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResult.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-800 hover:bg-gray-800/50">
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="px-4 py-2 text-sm text-gray-200 whitespace-nowrap">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Background>
  );
};

export default AIChatPage;


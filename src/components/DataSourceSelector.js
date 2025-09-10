import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Database, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { processExcelFile, processCSVFile, convertToSQLTable } from '../utils/dataProcessor';
import { GoogleSheetsService } from '../services/googleSheetsService';
import { toast } from 'react-toastify';

const DataSourceSelector = () => {
  const { dispatch } = useData();
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsLoading(true);

    try {
      let processedData;
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        processedData = await processExcelFile(file);
      } else if (file.name.endsWith('.csv')) {
        processedData = await processCSVFile(file);
      } else {
        throw new Error('Unsupported file format');
      }

      // Check if data is valid
      if (!processedData || !processedData.data || !Array.isArray(processedData.data) || processedData.data.length === 0) {
        throw new Error('No valid data found in file');
      }

      const sqlTable = await convertToSQLTable(processedData.data, processedData.tableName);
      
      dispatch({ type: 'SET_DATA', payload: processedData });
      dispatch({ type: 'SET_DATA_SOURCE', payload: 'file' });
      
      toast.success(`Successfully imported ${file.name}`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(`Error processing file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    }
  });

  const handleGoogleSheetsImport = async () => {
    if (!spreadsheetId.trim()) {
      toast.error('Please enter a Spreadsheet ID');
      return;
    }

    setIsLoading(true);
    try {
      const data = await GoogleSheetsService.fetchSheetData(spreadsheetId, sheetName);
      
      // Check if data is valid
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No valid data found in Google Sheets');
      }

      const columns = Object.keys(data[0]);
      const tableName = 'google_sheets_data';
      const sqlTable = await convertToSQLTable(data, tableName);
      
      dispatch({ type: 'SET_DATA', payload: { data, columns, tableName } });
      dispatch({ type: 'SET_DATA_SOURCE', payload: 'google_sheets' });
      dispatch({ type: 'SET_SPREADSHEET_INFO', payload: { spreadsheetId, sheetName } });
      
      toast.success('Successfully imported from Google Sheets');
    } catch (error) {
      console.error('Error importing from Google Sheets:', error);
      toast.error(`Error importing from Google Sheets: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Import Data Section */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 glow-card">
        <h2 className="text-2xl font-bold text-white mb-6 tracking-wider" style={{ fontFamily: 'var(--font-unbounded)' }}>
          Import Data
        </h2>

        {/* File Upload Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-400" />
            <span>Upload Excel or CSV File</span>
          </h3>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-white/30 hover:border-white/50 hover:bg-white/5'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
            <p className="text-white/80 mb-2">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="text-white/60 text-sm">Supports Excel (.xlsx, .xls) and CSV files</p>
          </div>
        </div>

        {/* Google Sheets Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-green-400" />
            <span>Import from Google Sheets</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Spreadsheet ID</label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs740gvE2upms"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all duration-300"
              />
              <p className="text-white/60 text-xs mt-1">You can find this in the URL of your Google Sheet</p>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">Sheet Name (optional)</label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="Sheet1"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all duration-300"
              />
            </div>
            
            <button
              onClick={handleGoogleSheetsImport}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>{isLoading ? 'Importing...' : 'Import from Google Sheets'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceSelector;

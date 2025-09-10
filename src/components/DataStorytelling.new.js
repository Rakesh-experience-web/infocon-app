//this is the one i am currently doing 

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useData } from '../context/DataContext';
import { toast } from 'react-toastify';
import { BarChart2, Upload, Settings, ArrowLeft, X, Loader2 } from 'lucide-react';
import TrendChart from './storytelling/TrendChart';
import { processFile } from '../utils/fileProcessing';

const DataStorytelling = ({ onBack }) => {
  const { dispatch: dataDispatch } = useData();
  const [displayData, setDisplayData] = useState([]);
  const [analysisState, setAnalysisState] = useState({
    showSettings: false,
    showUploadModal: false,
    uploadingFile: false,
    isAnalyzing: false,
    selectedX: '',
    selectedY: '',
    analysisResults: null,
    aiApiKey: localStorage.getItem('aiApiKey') || '',
    error: null,
    columns: []
  });

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    if (fileRejections?.length > 0) {
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach(err => toast.error(`Error with ${file.name}: ${err.message}`));
      });
      return;
    }

    if (!acceptedFiles?.length) return;

    const file = acceptedFiles[0];
    setAnalysisState(prev => ({ ...prev, uploadingFile: true }));

    try {
      const result = await processFile(file);
      if (result?.data?.length) {
        setDisplayData(result.data);
        setAnalysisState(prev => ({
          ...prev,
          uploadingFile: false,
          showUploadModal: false,
          columns: Object.keys(result.data[0] || {}),
          selectedX: '',
          selectedY: '',
          analysisResults: null
        }));
        toast.success('File uploaded successfully!');
      } else {
        throw new Error('No valid data found in the file');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setAnalysisState(prev => ({
        ...prev,
        error: error.message,
        uploadingFile: false
      }));
      toast.error(`Error: ${error.message}`);
    }
  }, [dataDispatch]);

  // File upload handling
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDrop
  });

  // Handle analysis execution
  const runAnalysis = useCallback(() => {
    if (!analysisState.selectedX || !analysisState.selectedY) {
      toast.error('Please select both X and Y axes');
      return;
    }

    setAnalysisState(prev => ({ ...prev, isAnalyzing: true }));

    // Simulate analysis
    setTimeout(() => {
      const values = displayData
        .map(d => parseFloat(d[analysisState.selectedY]))
        .filter(v => !isNaN(v));
      
      if (!values.length) {
        toast.error('No valid numeric data found for Y-axis');
        setAnalysisState(prev => ({ ...prev, isAnalyzing: false }));
        return;
      }

      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysisResults: {
          average: avg,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
          trend: 'Stable' // Simplified for brevity
        }
      }));
      
      toast.success('Analysis completed!');
    }, 1000);
  }, [analysisState.selectedX, analysisState.selectedY, displayData]);

  // Toggle settings panel
  const toggleSettings = useCallback(() => {
    setAnalysisState(prev => ({ ...prev, showSettings: !prev.showSettings }));
  }, []);

  // Save API key
  const handleSetAIKey = useCallback(() => {
    localStorage.setItem('aiApiKey', analysisState.aiApiKey);
    toast.success('API key saved!');
  }, [analysisState.aiApiKey]);

  // Render main content
  const renderMainContent = () => (
    <div className="space-y-6">
      {/* Analysis controls and results will go here */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Data Analysis</h2>
        {/* Simplified UI elements */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold">Trend Analysis</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSettings}
              className={`p-2 rounded-full ${analysisState.showSettings ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={() => setAnalysisState(prev => ({ ...prev, showUploadModal: true }))}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {displayData.length ? 'Change Data' : 'Upload Data'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default DataStorytelling;

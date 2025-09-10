import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Play, Save, Share, Settings, 
  BarChart3, PieChart, TrendingUp, MessageSquare, 
  Lightbulb, Target, AlertTriangle, ArrowLeft, Download,
  ChevronLeft, ChevronRight, Fullscreen, Eye, Brain,
  Sparkles, Zap, Globe, Cpu, Database, FileText,
  Clock, Users, Star, Award, Rocket, Target as TargetIcon,
   Upload, FileSpreadsheet, X, Palette, Brush, Layers,
  Grid3X3, BarChart4, Activity, TrendingDown, PieChart as PieChartIcon,
  ScatterChart, LineChart, AreaChart, Gauge, Target as TargetIcon2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useStory } from '../context/StoryContext';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import ChartRenderer from './storytelling/ChartRenderer';
import StoryPreview from './storytelling/StoryPreview';
import AIInsightsPanel from './storytelling/AIInsightsPanel';
import { processFile } from '../utils/dataProcessor';

const DataStorytelling = ({ onBack }) => {
  const { data, results, dispatch: dataDispatch } = useData();
  const { 
    stories, currentStory, templates, aiInsights, creationProgress,
    getCurrentStory, createStory, addSlide, generateAIStory, exportStory, dispatch: storyDispatch,
    aiApiKey, setCurrentStory
  } = useStory();
  
  const [showPreview, setShowPreview] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [aiApiKeyInput, setAiApiKeyInput] = useState(aiApiKey || '');
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [userGoals, setUserGoals] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);

  const displayData = results || data;
  const story = getCurrentStory();

  // Dropzone configuration
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadingFile(true);

    try {
      console.log('Starting file processing...');
      const processedData = await processFile(file);
      console.log('File processed successfully:', processedData);
      
      if (!processedData || processedData.length === 0) {
        throw new Error('No data was extracted from the file');
      }
      
      // Update both data and results using dispatch
      dataDispatch({
        type: 'SET_DATA',
        payload: {
          data: processedData,
          columns: Object.keys(processedData[0] || {}),
          tableName: 'uploaded_data'
        }
      });
      
      dataDispatch({
        type: 'SET_RESULTS',
        payload: processedData
      });
      
      toast.success(`Data loaded successfully! ${processedData.length} rows imported.`);
      setShowUploadModal(false);
    } catch (error) {
      console.error('File processing error:', error);
      const errorMessage = error.message || 'Failed to process file. Please check the file format.';
      toast.error(errorMessage);
    } finally {
      setUploadingFile(false);
    }
  }, [dataDispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  const handleSetAIKey = useCallback(() => {
    if (aiApiKeyInput.trim()) {
      storyDispatch({ type: 'SET_AI_API_KEY', payload: aiApiKeyInput.trim() });
      toast.success('AI API key set successfully!');
    } else {
      toast.error('Please enter a valid API key');
    }
  }, [aiApiKeyInput, storyDispatch]);

  const predefinedGoals = [
    'Analyze performance trends over time',
    'Identify growth and decline patterns',
    'Compare performance across different segments',
    'Detect seasonal variations and cycles',
    'Forecast future performance trends',
    'Identify performance outliers and anomalies',
    'Analyze correlation between metrics',
    'Benchmark performance against targets',
    'Identify optimization opportunities',
    'Generate performance insights and recommendations'
  ];

  const slideTypes = [
    { 
      type: 'title', 
      icon: BookOpen, 
      label: 'Overview', 
      color: 'text-blue-400',
      description: 'Performance analysis introduction'
    },
    { 
      type: 'chart', 
      icon: BarChart3, 
      label: 'Trend Chart', 
      color: 'text-green-400',
      description: 'Performance trend visualization'
    },
    { 
      type: 'metric', 
      icon: Target, 
      label: 'KPI Metric', 
      color: 'text-purple-400',
      description: 'Key performance indicators'
    },
    { 
      type: 'insight', 
      icon: Lightbulb, 
      label: 'Performance Insight', 
      color: 'text-yellow-400',
      description: 'AI-generated performance insights'
    },
    { 
      type: 'text', 
      icon: MessageSquare, 
      label: 'Analysis', 
      color: 'text-cyan-400',
      description: 'Performance analysis narrative'
    },
    { 
      type: 'comparison', 
      icon: TrendingUp, 
      label: 'Benchmark', 
      color: 'text-orange-400',
      description: 'Performance benchmarking'
    }
  ];

  const handleCreateStory = useCallback((template = null) => {
    if (!displayData || displayData.length === 0) {
      toast.error('Please load data first before creating a story');
      setShowUploadModal(true);
      return;
    }

    const newStory = createStory({
      title: template ? template.name : 'Untitled Story',
      description: template ? template.description : 'A data story created with INFOCON',
      dataSource: displayData,
      template: template?.id,
      metadata: {
        rowCount: displayData.length,
        columnCount: Object.keys(displayData[0] || {}).length,
        columns: Object.keys(displayData[0] || {})
      }
    });

    toast.success('New story created!');
  }, [displayData, createStory]);

  const handleAIGenerateStory = useCallback(async (template) => {
    if (!displayData || displayData.length === 0) {
      toast.error('Please load data first');
      setShowUploadModal(true);
      return;
    }

    if (!aiApiKey) {
      toast.error('Please set your AI API key first');
      return;
    }

    // Show goals modal first
    setShowGoalsModal(true);
  }, [displayData, aiApiKey]);

  const handleGenerateWithGoals = useCallback(async (template) => {
    setIsGenerating(true);
    setShowGoalsModal(false);
    
    try {
      const goalsText = selectedGoals.length > 0 
        ? `User wants to: ${selectedGoals.join(', ')}. ${userGoals}`
        : userGoals || 'General data exploration and insights';
        
      await generateAIStory(displayData, template, aiApiKey, goalsText);
      toast.success('AI-generated story created successfully!');
      setShowAIInsights(true);
    } catch (error) {
      console.error('AI story generation failed:', error);
      toast.error(`AI generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [displayData, aiApiKey, generateAIStory, selectedGoals, userGoals]);

  const handleAddSlide = useCallback((slideType) => {
    if (!currentStory || !story) {
      toast.error('Please create a story first');
      return;
    }

    const columns = Object.keys(displayData[0] || {});
    const baseSlide = {
      type: slideType,
      title: `New ${slideType} Slide`,
      content: '',
      config: {},
      data: displayData
    };

    // Add type-specific configurations with meaningful content
    switch (slideType) {
      case 'title':
        baseSlide.title = 'Performance Analysis Overview';
        baseSlide.content = `This performance analysis examines ${displayData.length} records across ${columns.length} key performance indicators. Our comprehensive trend analysis reveals critical insights for optimizing business performance.`;
        break;
      case 'chart':
        baseSlide.title = `${columns[0]} Performance Trend`;
        baseSlide.content = `This trend chart visualizes the performance of ${columns[0]} over time, showing key patterns and performance indicators that drive business decisions.`;
        baseSlide.config = {
          chartType: 'line',
          xAxis: columns[0] || '',
          yAxis: columns[1] || '',
          color: '#3B82F6'
        };
        break;
      case 'metric':
        const metricValue = displayData.length;
        baseSlide.title = `Performance Summary: ${metricValue} Records`;
        baseSlide.content = `Our performance dataset contains ${metricValue} records, providing a comprehensive view of performance trends and key indicators across all business segments.`;
        baseSlide.config = {
          metric: 'count',
          target: columns[0] || '',
          format: 'number',
          value: metricValue
        };
        break;
      case 'insight':
        baseSlide.title = 'Key Performance Insight';
        baseSlide.content = `Deep performance analysis of ${displayData.length} records reveals critical trends and patterns. Our examination identifies significant performance variations and optimization opportunities across different business segments.`;
        baseSlide.config = {
          type: 'positive',
          icon: 'trending-up'
        };
        break;
      case 'text':
        baseSlide.title = 'Performance Analysis';
        baseSlide.content = `Our comprehensive performance analysis of ${displayData.length} records across ${columns.length} dimensions reveals critical insights for business optimization. The data demonstrates clear performance patterns that can inform strategic decisions.`;
        break;
      case 'comparison':
        baseSlide.title = 'Performance Benchmarking';
        baseSlide.content = `Comparing performance across different segments reveals important insights. The analysis shows how various performance factors interact and influence overall business outcomes.`;
        baseSlide.config = {
          comparisonType: 'benchmark',
          metrics: columns.slice(0, 2)
        };
        break;
    }

    addSlide(baseSlide);
    toast.success(`${slideType} slide added!`);
  }, [currentStory, addSlide, displayData]);

  const handleSaveStory = useCallback(() => {
    if (!story) {
      toast.error('No story to save');
      return;
    }
    
    storyDispatch({ 
      type: 'UPDATE_STORY', 
      payload: { 
        id: story.id, 
        updatedAt: new Date().toISOString() 
      } 
    });
    
    toast.success('Story saved successfully!');
  }, [story, storyDispatch]);

  const handleExportStory = useCallback(async (format) => {
    if (!story) {
      toast.error('No story to export');
      return;
    }
    
    try {
      await exportStory(story.id, format);
      toast.success(`Analysis exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`);
    }
  }, [story, exportStory]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Minimal Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle Geometric Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 transform rotate-45"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-white/3 transform -rotate-12"></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-white/4 transform rotate-30"></div>
        <div className="absolute top-1/2 right-20 w-20 h-20 bg-white/2 transform -rotate-45"></div>
        
        {/* Minimal Lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-white/10"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-white/5"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/10"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-white/5"></div>
        
        {/* Subtle Dots */}
        <div className="absolute top-10 right-10 w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute top-20 left-1/4 w-0.5 h-0.5 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-20 right-1/4 w-1 h-1 bg-white/25 rounded-full"></div>
      </div>

      {/* Minimal Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-black/80 backdrop-blur-md border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 text-sm bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <Sparkles className="w-3 h-3 text-white absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Data Canvas Studio
                  </h1>
                  <p className="text-xs text-gray-400">Transform data into visual masterpieces</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <Upload className="w-4 h-4" />
                Upload Data
              </motion.button>
              
              {story && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAIInsights(!showAIInsights)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
                  >
                    <Brain className="w-4 h-4" />
                    AI Insights
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveStory}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-6 gap-4">
          {/* Artistic Sidebar */}
          <div className="xl:col-span-2 space-y-6">
            {/* Data Canvas Status */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <Database className="w-3 h-3 text-white" />
                </div>
                <h3 className="font-bold text-white text-sm">Data Canvas</h3>
              </div>
              
              {displayData && displayData.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white font-semibold text-xs">Canvas Ready</span>
                    </div>
                    <div className="text-xs text-gray-300">
                      {displayData.length} data points, {Object.keys(displayData[0] || {}).length} dimensions
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white/10 rounded-lg text-center">
                      <div className="text-lg font-bold text-white">{displayData.length}</div>
                      <div className="text-xs text-gray-400">Records</div>
                    </div>
                    <div className="p-2 bg-white/10 rounded-lg text-center">
                      <div className="text-lg font-bold text-white">{Object.keys(displayData[0] || {}).length}</div>
                      <div className="text-xs text-gray-400">Columns</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-300 font-semibold text-xs">Empty Canvas</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Upload your data to start
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowUploadModal(true)}
                    className="w-full p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center gap-2 text-sm"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Data
                  </motion.button>
                </div>
              )}

              {/* AI Configuration */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                    <Brain className="w-3 h-3 text-white" />
                  </div>
                  <h4 className="font-semibold text-white text-xs">AI Assistant</h4>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="password"
                    value={aiApiKeyInput}
                    onChange={(e) => setAiApiKeyInput(e.target.value)}
                    placeholder="AI API Key"
                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-xs focus:outline-none focus:ring-1 focus:ring-white text-white placeholder-gray-400"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSetAIKey}
                    className="w-full px-2 py-1 bg-white/10 text-white rounded text-xs hover:bg-white/20 transition-all duration-300 border border-white/20"
                  >
                    Configure AI
                  </motion.button>
                  {aiApiKey && (
                    <div className="p-2 bg-white/10 rounded border border-white/20">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <span className="text-white text-xs font-medium">AI Ready</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

                        {/* Creative Studio */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <Brush className="w-3 h-3 text-white" />
                </div>
                <h3 className="font-bold text-white text-sm">Creative Studio</h3>
              </div>
              
                              {!currentStory ? (
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCreateStory()}
                    disabled={!displayData || displayData.length === 0}
                    className="w-full p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 text-sm"
                  >
                    <Brush className="w-4 h-4" />
                    <span className="font-semibold">Start Creating</span>
                  </motion.button>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-3 h-3 text-white" />
                    <span className="text-xs font-semibold text-white">AI Templates</span>
                  </div>
                  
                  <div className="space-y-2">
                    {templates.map(template => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedTemplate(template);
                          handleAIGenerateStory(template);
                        }}
                        disabled={isGenerating || !displayData || displayData.length === 0 || !aiApiKey}
                        className="w-full p-3 text-left bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-sm text-white">{template.icon}</span>
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-white text-xs">{template.name}</div>
                            <div className="text-xs text-gray-400">{template.description}</div>
                          </div>
                        </div>
                        {isGenerating && selectedTemplate?.id === template.id && (
                          <div className="mt-2">
                            <div className="w-full bg-white/20 rounded-full h-1">
                              <div 
                                className="bg-white h-1 rounded-full transition-all duration-300"
                                style={{ width: `${creationProgress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 text-center">
                              Creating... {creationProgress}%
                            </div>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="font-semibold text-white text-xs mb-1">{story?.title || 'Untitled Story'}</div>
                    <div className="text-xs text-gray-300">{story?.slides?.length || 0} elements</div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="w-3 h-3 text-white" />
                    <span className="text-xs font-semibold text-white">Add Elements</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {slideTypes.map(slideType => (
                      <motion.button
                        key={slideType.type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAddSlide(slideType.type)}
                        className="p-2 text-left bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <slideType.icon className={`w-3 h-3 ${slideType.color}`} />
                          <div className="font-medium text-white text-xs">{slideType.label}</div>
                        </div>
                        <div className="text-xs text-gray-400">{slideType.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Data Insights Dashboard */}
            {displayData && displayData.length > 0 && (
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-sm">Data Insights</h3>
                </div>
                
                <div className="space-y-3">
                  {/* Data Quality */}
                  <div className="p-2 bg-white/10 rounded border border-white/20">
                    <div className="text-xs font-semibold text-white mb-1">Data Quality</div>
                    <div className="text-xs text-gray-300">
                      {displayData.length} records, {Object.keys(displayData[0] || {}).length} columns
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {displayData.filter(row => Object.values(row).some(val => val !== null && val !== '')).length} complete rows
                    </div>
                  </div>
                  
                  {/* Column Analysis */}
                  <div className="p-2 bg-white/10 rounded border border-white/20">
                    <div className="text-xs font-semibold text-white mb-2">Column Types</div>
                    <div className="space-y-1">
                      {Object.keys(displayData[0] || {}).slice(0, 3).map((column, index) => {
                        const sampleValue = displayData[0]?.[column];
                        const isNumeric = !isNaN(sampleValue) && sampleValue !== '';
                        const isDate = !isNaN(Date.parse(sampleValue));
                        
                        return (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="text-gray-300 truncate">{column}</span>
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              isNumeric ? 'bg-white/20 text-white' :
                              isDate ? 'bg-white/15 text-gray-300' :
                              'bg-white/10 text-gray-400'
                            }`}>
                              {isNumeric ? 'Number' : isDate ? 'Date' : 'Text'}
                            </span>
                          </div>
                        );
                      })}
                      {Object.keys(displayData[0] || {}).length > 3 && (
                        <div className="text-xs text-gray-400">+{Object.keys(displayData[0] || {}).length - 3} more</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Value Ranges */}
                  <div className="p-2 bg-white/10 rounded border border-white/20">
                    <div className="text-xs font-semibold text-white mb-2">Value Ranges</div>
                    <div className="space-y-1">
                      {Object.keys(displayData[0] || {}).slice(0, 2).map((column, index) => {
                        const values = displayData.map(row => row[column]).filter(val => !isNaN(val) && val !== '');
                        const min = Math.min(...values);
                        const max = Math.max(...values);
                        const avg = values.reduce((a, b) => a + b, 0) / values.length;
                        
                        return values.length > 0 ? (
                          <div key={index} className="text-xs text-gray-300">
                            <div className="font-medium">{column}</div>
                            <div className="text-gray-400">Min: {min.toFixed(2)} | Max: {max.toFixed(2)} | Avg: {avg.toFixed(2)}</div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAIInsights(true)}
                      className="w-full p-2 bg-white/10 text-white rounded text-xs hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center gap-1"
                    >
                      <Brain className="w-3 h-3" />
                      AI Analysis
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}



                         {/* Data Analysis Summary */}
             {displayData && (
               <motion.div 
                 initial={{ x: -50, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ delay: 0.3 }}
                 className="glass rounded-xl p-6 border border-white/20"
               >
                                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                     <TargetIcon className="w-4 h-4" />
                     Performance Data Summary
                   </h3>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                     <span className="text-gray-300">Total Records</span>
                     <span className="font-bold text-white">{displayData.length}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                     <span className="text-gray-300">Data Columns</span>
                     <span className="font-bold text-white">{Object.keys(displayData[0] || {}).length}</span>
                   </div>
                                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                       <span className="text-gray-300">Analyses Created</span>
                       <span className="font-bold text-white">{stories.length}</span>
                     </div>
                   
                   {/* Column Types */}
                   <div className="mt-4">
                     <h4 className="text-sm font-medium text-gray-300 mb-2">Column Types:</h4>
                     <div className="space-y-2">
                       {Object.keys(displayData[0] || {}).map((column, index) => {
                         const sampleValue = displayData[0]?.[column];
                         const isNumeric = !isNaN(sampleValue) && sampleValue !== '';
                         const isDate = !isNaN(Date.parse(sampleValue));
                         
                         return (
                           <div key={index} className="flex items-center justify-between text-xs">
                             <span className="text-gray-400 truncate">{column}</span>
                             <span className={`px-2 py-1 rounded text-xs ${
                               isNumeric ? 'bg-green-500/20 text-green-300' :
                               isDate ? 'bg-blue-500/20 text-blue-300' :
                               'bg-purple-500/20 text-purple-300'
                             }`}>
                               {isNumeric ? 'Number' : isDate ? 'Date' : 'Text'}
                             </span>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                   
                   <button
                     onClick={() => setShowAIInsights(true)}
                     className="w-full mt-4 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-md hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                   >
                     <Brain className="w-4 h-4" />
                     View AI Analysis
                   </button>
                 </div>
               </motion.div>
             )}
          </div>

          {/* Main Dashboard */}
          <div className="xl:col-span-4 space-y-6">
            {!displayData || displayData.length === 0 ? (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute top-2 right-1/4 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2 h-2 text-white animate-pulse" />
                  </div>
                  <div className="absolute bottom-2 left-1/4 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                    <Database className="w-2 h-2 text-white animate-pulse" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Welcome to Your Data Canvas
                </h2>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Transform your data into visual masterpieces. Upload your Excel, CSV, or Google Sheets data 
                  and let AI create stunning visualizations and insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUploadModal(true)}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 border border-white/20"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="font-semibold">Upload Your Data</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAIInsights(true)}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 border border-white/20"
                  >
                    <Brain className="w-4 h-4" />
                    <span className="font-semibold">Explore AI Insights</span>
                  </motion.button>
                </div>
              </motion.div>
            ) : !currentStory ? (
              <div className="space-y-4">
                {/* Data Overview Dashboard */}
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Your Data is Ready!</h2>
                      <p className="text-gray-400 text-sm">Transform it into visual masterpieces</p>
                    </div>
                  </div>
                  
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                          <BarChart3 className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-gray-400">Records</span>
                      </div>
                      <div className="text-xl font-bold text-white">{displayData.length}</div>
                    </div>
                    
                    <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                          <Grid3X3 className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-gray-400">Columns</span>
                      </div>
                      <div className="text-xl font-bold text-white">{Object.keys(displayData[0] || {}).length}</div>
                    </div>
                    
                    <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                          <TrendingUp className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-gray-400">Stories</span>
                      </div>
                      <div className="text-xl font-bold text-white">{stories.length}</div>
                    </div>
                    
                    <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                          <Star className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-gray-400">AI Ready</span>
                      </div>
                      <div className="text-xl font-bold text-white">{aiApiKey ? '✓' : '✗'}</div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCreateStory()}
                      className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 border border-white/20"
                    >
                      <Brush className="w-4 h-4" />
                      <span className="font-semibold">Start Creating</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAIInsights(true)}
                      className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 border border-white/20"
                    >
                      <Brain className="w-4 h-4" />
                      <span className="font-semibold">AI Insights</span>
                    </motion.button>
                  </div>
                </motion.div>
                
                {/* Data Preview */}
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/20"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Data Preview</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/20">
                          {Object.keys(displayData[0] || {}).slice(0, 4).map((column, index) => (
                            <th key={index} className="text-left p-2 text-gray-300 font-semibold">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {displayData.slice(0, 2).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b border-white/10">
                            {Object.keys(row).slice(0, 4).map((column, colIndex) => (
                              <td key={colIndex} className="p-2 text-gray-400">
                                {String(row[column]).substring(0, 15)}
                                {String(row[column]).length > 15 ? '...' : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            ) : (
              <>
                {/* Story Canvas */}
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                        <Layers className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Story Canvas</h3>
                        <p className="text-sm text-gray-400">{story?.slides?.length || 0} visual elements</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {story?.template && (
                        <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                          AI Generated
                        </span>
                      )}
                      {/* Export Options */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExportStory('json')}
                          className="px-3 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-lg hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300 border border-blue-500/30"
                        >
                          JSON
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExportStory('html')}
                          className="px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 border border-green-500/30"
                        >
                          HTML
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExportStory('pdf')}
                          className="px-3 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 rounded-lg hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 border border-red-500/30"
                        >
                          PDF
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  {story?.slides?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Layers className="w-12 h-12 text-orange-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Empty Canvas</h3>
                      <p className="text-gray-400 mb-6 text-sm">Start building your visual masterpiece by adding your first element</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddSlide('title')}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 rounded-xl hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300 border border-orange-500/30 flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Add First Element
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {story?.slides?.map((slide, index) => (
                          <motion.div
                            key={slide.id}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                            onClick={() => setEditingSlide(slide)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center text-lg font-bold">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-white text-base mb-1">{slide.title}</div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                  <span className="capitalize">{slide.type} element</span>
                                  {slide.type === 'chart' && (
                                    <span className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-2 py-1 rounded-full text-xs border border-green-500/30">
                                      {slide.config?.chartType || 'chart'}
                                    </span>
                                  )}
                                  {slide.type === 'metric' && (
                                    <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-2 py-1 rounded-full text-xs border border-purple-500/30">
                                      KPI
                                    </span>
                                  )}
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Delete slide logic
                                }}
                                className="p-2 text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-500/20"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>

                {/* Slide Editor */}
                {editingSlide && (
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                          <Settings className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Edit Visual Element</h3>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditingSlide(null)}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Element Title
                        </label>
                        <input
                          type="text"
                          value={editingSlide.title}
                          onChange={(e) => {
                            setEditingSlide(prev => ({ ...prev, title: e.target.value }));
                            // Update slide in context
                            if (story) {
                              const updatedSlides = story.slides.map(slide => 
                                slide.id === editingSlide.id 
                                  ? { ...slide, title: e.target.value }
                                  : slide
                              );
                              storyDispatch({
                                type: 'UPDATE_STORY',
                                payload: { 
                                  id: story.id, 
                                  slides: updatedSlides,
                                  updatedAt: new Date().toISOString()
                                }
                              });
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-400"
                          placeholder="Enter element title..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Element Content
                        </label>
                        <textarea
                          value={editingSlide.content}
                          onChange={(e) => {
                            setEditingSlide(prev => ({ ...prev, content: e.target.value }));
                            // Update slide in context
                            if (story) {
                              const updatedSlides = story.slides.map(slide => 
                                slide.id === editingSlide.id 
                                  ? { ...slide, content: e.target.value }
                                  : slide
                              );
                              storyDispatch({
                                type: 'UPDATE_STORY',
                                payload: { 
                                  id: story.id, 
                                  slides: updatedSlides,
                                  updatedAt: new Date().toISOString()
                                }
                              });
                            }
                          }}
                          rows="3"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 text-white resize-none placeholder-gray-400"
                          placeholder="Enter element content..."
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Live Preview
                      </label>
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/20">
                        <div className="text-center">
                          <h4 className="text-lg font-bold text-white mb-3">{editingSlide.title}</h4>
                          {editingSlide.content && (
                            <p className="text-gray-300 text-base leading-relaxed">{editingSlide.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Data Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl max-w-2xl w-full border border-white/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <Upload className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Upload Data</h2>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Supported Formats</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg">
                      <FileSpreadsheet className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-gray-300">CSV Files</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg">
                      <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-gray-300">Excel (.xlsx)</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg">
                      <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                      <span className="text-sm text-gray-300">Excel (.xls)</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <div className="text-sm text-blue-300 mb-2">
                      <strong>💡 Tips for successful upload:</strong>
                    </div>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Ensure your file has headers in the first row</li>
                      <li>• Remove any empty rows at the beginning or end</li>
                      <li>• For Excel files, make sure data starts from cell A1</li>
                      <li>• Maximum file size: 10MB</li>
                    </ul>
                  </div>
                </div>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-500/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  {uploadingFile ? (
                    <div className="space-y-2">
                      <div className="text-white font-medium">Processing file...</div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  ) : isDragActive ? (
                    <div className="text-blue-400 font-medium">Drop your file here...</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-white font-medium">Drag & drop your file here</div>
                      <div className="text-gray-400 text-sm">or click to browse</div>
                    </div>
                  )}
                </div>

                {/* Current Data Info */}
                {displayData && displayData.length > 0 && (
                  <div className="mt-6 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 font-medium">Current Data</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {displayData.length} rows, {Object.keys(displayData[0] || {}).length} columns loaded
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights Panel */}
      {showAIInsights && (
        <AIInsightsPanel 
          insights={aiInsights}
          onClose={() => setShowAIInsights(false)}
        />
      )}

             {/* Story Preview */}
       {showPreview && story && (
         <StoryPreview
           story={story}
           onClose={() => setShowPreview(false)}
           onExport={handleExportStory}
         />
       )}

       {/* Goals Modal */}
       <AnimatePresence>
         {showGoalsModal && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
           >
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-gray-900 rounded-2xl max-w-2xl w-full border border-white/20"
             >
               {/* Header */}
               <div className="flex items-center justify-between p-6 border-b border-white/20">
                 <div className="flex items-center gap-3">
                   <Target className="w-6 h-6 text-orange-400" />
                   <h2 className="text-xl font-bold text-white">What do you want to learn?</h2>
                 </div>
                 <button
                   onClick={() => setShowGoalsModal(false)}
                   className="p-2 text-gray-400 hover:text-white transition-colors"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>

               {/* Content */}
               <div className="p-6">
                 <div className="mb-6">
                   <h3 className="text-lg font-semibold text-white mb-3">Select your analysis goals:</h3>
                   
                   <div className="grid grid-cols-2 gap-3 mb-4">
                     {predefinedGoals.map((goal, index) => (
                       <button
                         key={index}
                         onClick={() => {
                           if (selectedGoals.includes(goal)) {
                             setSelectedGoals(selectedGoals.filter(g => g !== goal));
                           } else {
                             setSelectedGoals([...selectedGoals, goal]);
                           }
                         }}
                         className={`p-3 text-left rounded-lg border transition-all duration-300 ${
                           selectedGoals.includes(goal)
                             ? 'bg-orange-500/20 border-orange-500/30 text-white'
                             : 'bg-white/10 border-white/20 hover:bg-white/20 text-gray-300'
                         }`}
                       >
                         <div className="text-sm">{goal}</div>
                       </button>
                     ))}
                   </div>

                   <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                       Additional specific questions or goals:
                     </label>
                     <textarea
                       value={userGoals}
                       onChange={(e) => setUserGoals(e.target.value)}
                       placeholder="e.g., I want to understand why sales are declining in Q3, or I need to identify our top performing products..."
                       rows="3"
                       className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-white resize-none"
                     />
                   </div>

                   <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                     <div className="text-sm text-blue-300 mb-2">
                       <strong>💡 Tip:</strong> The more specific your goals, the better the AI analysis will be!
                     </div>
                     <div className="text-xs text-gray-300">
                       Our AI will perform deep column-by-column analysis and create a targeted presentation based on your goals.
                     </div>
                   </div>
                 </div>

                 {/* Actions */}
                 <div className="flex gap-3">
                   <button
                     onClick={() => setShowGoalsModal(false)}
                     className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={() => handleGenerateWithGoals(selectedTemplate)}
                     disabled={isGenerating}
                     className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isGenerating ? 'Generating...' : 'Generate Story'}
                   </button>
                 </div>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
 };

export default DataStorytelling;

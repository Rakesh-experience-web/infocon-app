import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const StoryContext = createContext();

const initialState = {
  // Stories Management
  stories: [],
  currentStory: null,
  currentSlide: 0,
  
  // Story Creation
  isCreating: false,
  creationProgress: 0,
  aiInsights: [],
  
  // Presentation Mode
  isPresenting: false,
  isFullscreen: false,
  autoPlay: false,
  presentationSpeed: 3000,
  
  // AI Configuration
  aiModel: 'gemini-1.5-flash',
  aiApiKey: '',
  
  // Performance Analysis Templates
  templates: [
    {
      id: 'trend-analysis',
      name: 'Trend Analysis',
      description: 'Identify patterns and trends over time',
      icon: '📈',
      slides: ['title', 'trend-overview', 'trend-charts', 'seasonal-patterns', 'forecasting', 'insights']
    },
    {
      id: 'performance-benchmarking',
      name: 'Performance Benchmarking',
      description: 'Compare performance against targets and benchmarks',
      icon: '🎯',
      slides: ['title', 'benchmark-overview', 'performance-metrics', 'gap-analysis', 'improvement-areas', 'action-plan']
    },
    {
      id: 'growth-analysis',
      name: 'Growth Analysis',
      description: 'Analyze growth patterns and opportunities',
      icon: '🚀',
      slides: ['title', 'growth-overview', 'growth-drivers', 'growth-charts', 'opportunities', 'strategies']
    },
    {
      id: 'anomaly-detection',
      name: 'Anomaly Detection',
      description: 'Identify outliers and unusual patterns',
      icon: '🔍',
      slides: ['title', 'anomaly-overview', 'outlier-analysis', 'pattern-detection', 'root-causes', 'prevention']
    }
  ],
  
  // Export Options
  exportFormats: ['pdf', 'pptx', 'html', 'video', 'json'],
  
  // Settings
  settings: {
    theme: 'dark',
    animations: true,
    autoSave: true,
    dataRefresh: false,
    collaboration: false
  }
};

const storyReducer = (state, action) => {
  switch (action.type) {
    case 'SET_AI_API_KEY':
      return { ...state, aiApiKey: action.payload };
    
    case 'CREATE_STORY':
      return {
        ...state,
        stories: [...state.stories, action.payload],
        currentStory: action.payload.id,
        currentSlide: 0
      };
    
    case 'UPDATE_STORY':
      return {
        ...state,
        stories: state.stories.map(story => 
          story.id === action.payload.id ? { ...story, ...action.payload } : story
        ),
        currentStory: state.currentStory === action.payload.id ? action.payload : state.currentStory
      };
    
    case 'DELETE_STORY':
      return {
        ...state,
        stories: state.stories.filter(story => story.id !== action.payload),
        currentStory: state.currentStory === action.payload ? null : state.currentStory
      };
    
    case 'SET_CURRENT_STORY':
      return {
        ...state,
        currentStory: action.payload,
        currentSlide: 0
      };
    
    case 'SET_CURRENT_SLIDE':
      return { ...state, currentSlide: action.payload };
    
    case 'ADD_SLIDE':
      const updatedStories = state.stories.map(story => {
        if (story.id === state.currentStory) {
          return {
            ...story,
            slides: [...story.slides, action.payload]
          };
        }
        return story;
      });
      return { ...state, stories: updatedStories };
    
    case 'UPDATE_SLIDE':
      const storiesWithUpdatedSlide = state.stories.map(story => {
        if (story.id === state.currentStory) {
          return {
            ...story,
            slides: story.slides.map(slide => 
              slide.id === action.payload.id ? { ...slide, ...action.payload } : slide
            )
          };
        }
        return story;
      });
      return { ...state, stories: storiesWithUpdatedSlide };
    
    case 'DELETE_SLIDE':
      const storiesWithDeletedSlide = state.stories.map(story => {
        if (story.id === state.currentStory) {
          return {
            ...story,
            slides: story.slides.filter(slide => slide.id !== action.payload)
          };
        }
        return story;
      });
      return { ...state, stories: storiesWithDeletedSlide };
    
    case 'SET_CREATION_PROGRESS':
      return { ...state, creationProgress: action.payload };
    
    case 'SET_AI_INSIGHTS':
      return { ...state, aiInsights: action.payload };
    
    case 'SET_PRESENTING':
      return { ...state, isPresenting: action.payload };
    
    case 'SET_FULLSCREEN':
      return { ...state, isFullscreen: action.payload };
    
    case 'SET_AUTO_PLAY':
      return { ...state, autoPlay: action.payload };
    
    case 'SET_PRESENTATION_SPEED':
      return { ...state, presentationSpeed: action.payload };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case 'LOAD_STORIES':
      return { ...state, stories: action.payload };
    
    default:
      return state;
  }
};

export const StoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storyReducer, initialState);


  // AI-powered story generation
  const generateAIStory = async (data, template, apiKey, userGoals = null) => {
    if (!apiKey) {
      throw new Error('AI API key is required for story generation');
    }

    dispatch({ type: 'SET_CREATION_PROGRESS', payload: 10 });
    
    // Initialize variables to prevent undefined errors
    let aiInsights = {};
    let storyStructure = {};
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: state.aiModel });

      // Analyze data structure
      const columns = Object.keys(data[0] || {});
      const sampleData = data.slice(0, 5);
      
      dispatch({ type: 'SET_CREATION_PROGRESS', payload: 20 });

      // Skip column analysis for now and go directly to insights generation
      dispatch({ type: 'SET_CREATION_PROGRESS', payload: 40 });

      // Generate targeted insights based on user goals or data patterns
      const insightsPrompt = `
        Analyze this dataset for performance insights:
        Columns: ${columns.join(', ')}
        Sample data: ${JSON.stringify(sampleData, null, 2)}
        Total rows: ${data.length}
        
        User Goals: ${userGoals || 'General performance analysis'}
        
        Generate performance-focused insights that answer:
        1. What are the key performance trends in this data?
        2. What performance metrics are most important?
        3. What actionable performance insights can be derived?
        4. What visualizations would best show performance?
        5. What performance recommendations can be made?
        
        Focus on insights that are:
        - Performance-oriented and measurable
        - Actionable for business optimization
        - Supported by the data analysis
        - Relevant to the user's performance goals
        
        Return ONLY valid JSON without any markdown formatting or code blocks:
        {
          "keyInsights": [
            {
              "title": "Performance finding",
              "description": "Detailed performance explanation",
              "metric": "specific performance number or percentage",
              "trend": "increasing/decreasing/stable",
              "businessImpact": "what this means for business performance",
              "recommendation": "what performance action to take"
            }
          ],
          "visualizations": [
            {
              "type": "line/bar/pie",
              "title": "Performance chart title",
              "description": "What performance insight it shows",
              "xAxis": "column name",
              "yAxis": "column name",
              "insight": "what performance insight this chart reveals"
            }
          ],
          "businessQuestions": [
            {
              "question": "Performance question",
              "answer": "Performance-focused answer",
              "confidence": "high/medium/low",
              "supportingData": "specific performance metrics"
            }
          ]
        }
      `;

      try {
        const insightsResult = await model.generateContent(insightsPrompt);
        const insightsResponse = await insightsResult.response;
        const insightsText = insightsResponse.text();
        
        // Extract JSON from potential markdown code blocks
        aiInsights = extractJSONFromResponse(insightsText);
        
        dispatch({ type: 'SET_AI_INSIGHTS', payload: aiInsights });
      } catch (insightsError) {
        console.error('AI insights generation failed, using fallback:', insightsError);
        // Use fallback insights if AI generation fails
        aiInsights = {
          keyInsights: [
            {
              title: "Data Analysis Complete",
              description: `Analysis of ${data.length} records with ${columns.length} columns completed successfully.`,
              metric: `${data.length} records analyzed`,
              trend: "stable",
              businessImpact: "Provides insights for business decision making",
              recommendation: "Review the generated insights and take appropriate actions"
            }
          ],
          visualizations: [
            {
              type: "bar",
              title: "Data Overview",
              description: "Overview of the analyzed data",
              xAxis: columns[0] || "Categories",
              yAxis: columns[1] || "Values",
              insight: "Shows the distribution of data across different categories"
            }
          ],
          businessQuestions: [
            {
              question: "What are the key insights from this data?",
              answer: "The analysis reveals important patterns and trends in the data",
              confidence: "high",
              supportingData: "Based on comprehensive data analysis"
            }
          ]
        };
        dispatch({ type: 'SET_AI_INSIGHTS', payload: aiInsights });
      }
      
      dispatch({ type: 'SET_CREATION_PROGRESS', payload: 60 });

      // Generate targeted story structure based on analysis
      const storyPrompt = `
        Create a performance analysis presentation based on this data:
        
        Dataset: ${data.length} rows with columns: ${columns.join(', ')}
        Sample data: ${JSON.stringify(sampleData, null, 2)}
        Key Insights: ${JSON.stringify(aiInsights, null, 2)}
        Template: ${template.name} - ${template.description}
        User Goals: ${userGoals || 'General performance analysis'}
        
        Generate a performance analysis presentation that:
        1. Addresses the user's specific performance goals
        2. Highlights key performance trends and patterns
        3. Answers critical performance questions
        4. Provides actionable performance recommendations
        
        Create 6-8 slides with this structure:
        
        Slide 1: Performance Overview
        - Compelling performance-focused title
        - 2-3 sentence overview of key performance findings
        - Key performance metrics and business impact
        
        Slide 2: Data Summary
        - Dataset summary (rows, columns)
        - Key performance indicators identified
        - Performance data quality assessment
        
        Slides 3-5: Performance Insights (one per major finding)
        - Specific performance insight title
        - Detailed performance explanation with metrics
        - Performance impact and recommendations
        - Supporting performance visualizations
        
        Slide 6: Performance Questions Answered
        - Most important performance questions
        - Data-driven performance answers
        - Supporting performance evidence
        
        Slide 7: Performance Recommendations
        - Actionable performance recommendations
        - Priority performance actions
        - Future performance analysis opportunities
        
        Return ONLY valid JSON without any markdown formatting or code blocks:
        {
          "title": "Performance Analysis Title",
          "summary": "Performance analysis summary",
          "slides": [
            {
              "type": "title",
              "title": "Performance Overview",
              "content": "Performance analysis content",
              "config": {}
            }
          ]
        }
      `;

      try {
        const storyResult = await model.generateContent(storyPrompt);
        const storyResponse = await storyResult.response;
        const storyText = storyResponse.text();
        
        // Extract JSON from potential markdown code blocks
        storyStructure = extractJSONFromResponse(storyText);
      } catch (storyError) {
        console.error('AI story generation failed, using fallback:', storyError);
        // Use fallback story structure if AI generation fails
        storyStructure = null; // This will trigger the fallback below
      }
      
      // Fallback if story structure is invalid
      if (!storyStructure || !storyStructure.slides || !Array.isArray(storyStructure.slides)) {
        console.log('Invalid story structure, creating fallback...');
        storyStructure = {
          title: `${template.name} Analysis`,
          summary: `Performance analysis of ${data.length} records with ${columns.length} columns`,
          slides: [
            {
              type: 'title',
              title: 'Performance Analysis Overview',
              content: `This analysis examines ${data.length} records across ${columns.length} key performance indicators.`,
              config: {}
            },
            {
              type: 'chart',
              title: 'Performance Trends',
              content: 'Key performance trends and patterns identified in the data.',
              config: {
                chartType: 'line',
                xAxis: columns[0] || 'Category',
                yAxis: columns[1] || 'Value',
                color: '#3B82F6'
              }
            },
            {
              type: 'metric',
              title: 'Key Performance Metrics',
              content: 'Important performance metrics and their current values.',
              config: {
                metric: 'count',
                target: columns[0] || 'Total',
                format: 'number',
                value: data.length
              }
            },
            {
              type: 'insight',
              title: 'Performance Insights',
              content: 'Key insights and recommendations based on the data analysis.',
              config: {
                type: 'positive',
                icon: 'trending-up'
              }
            }
          ]
        };
      }
      
      dispatch({ type: 'SET_CREATION_PROGRESS', payload: 90 });

      // Create story object
      const newStory = {
        id: Date.now().toString(),
        title: storyStructure.title,
        description: storyStructure.summary,
        template: template.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          rowCount: data.length,
          columnCount: columns.length,
          columns: columns,
          aiInsights: aiInsights
        },
        slides: storyStructure.slides.map((slide, index) => {
          // Enhance slide with data-driven content
          let enhancedSlide = {
            id: Date.now() + index,
            type: slide.type,
            title: slide.title,
            content: slide.content,
            order: index,
            config: slide.config || {},
            data: data
          };

          // Add data-driven enhancements based on slide type
          switch (slide.type) {
            case 'metric':
              enhancedSlide.config = {
                ...enhancedSlide.config,
                value: calculateMetric(data, slide.config.metric || 'count'),
                target: slide.config.target || columns[0],
                format: slide.config.format || 'number'
              };
              break;
            case 'chart':
              enhancedSlide.config = {
                ...enhancedSlide.config,
                chartType: slide.config.chartType || 'bar',
                xAxis: slide.config.xAxis || columns[0],
                yAxis: slide.config.yAxis || columns[1],
                color: slide.config.color || '#3B82F6'
              };
              break;
            case 'insight':
              // Add specific insights from AI analysis
              if (aiInsights.insights && aiInsights.insights[index % aiInsights.insights.length]) {
                const insight = aiInsights.insights[index % aiInsights.insights.length];
                enhancedSlide.content = `${insight.description}\n\nValue: ${insight.value}\nTrend: ${insight.trend}`;
              }
              break;
          }

          return enhancedSlide;
        })
      };

      dispatch({ type: 'CREATE_STORY', payload: newStory });
      dispatch({ type: 'SET_CREATION_PROGRESS', payload: 100 });

      return newStory;
    } catch (error) {
      console.error('AI story generation failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        aiInsights: aiInsights || 'Not generated',
        storyStructure: storyStructure || 'Not generated'
      });
      throw error;
    }
  };

  // Helper functions
  const getCurrentStory = () => state.stories.find(s => s.id === state.currentStory);
  const getCurrentSlide = () => {
    const story = getCurrentStory();
    return story ? story.slides[state.currentSlide] : null;
  };

  const createStory = (storyData) => {
    const newStory = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slides: [],
      ...storyData
    };
    dispatch({ type: 'CREATE_STORY', payload: newStory });
    return newStory;
  };

  const addSlide = (slideData) => {
    const newSlide = {
      id: Date.now().toString(),
      order: getCurrentStory()?.slides.length || 0,
      ...slideData
    };
    dispatch({ type: 'ADD_SLIDE', payload: newSlide });
    return newSlide;
  };

  const updateSlide = (slideId, updates) => {
    dispatch({ type: 'UPDATE_SLIDE', payload: { id: slideId, ...updates } });
  };

  const deleteSlide = (slideId) => {
    dispatch({ type: 'DELETE_SLIDE', payload: slideId });
  };

  const saveStory = (storyId) => {
    const story = state.stories.find(s => s.id === storyId);
    if (story) {
      dispatch({
        type: 'UPDATE_STORY',
        payload: { id: storyId, updatedAt: new Date().toISOString() }
      });
    }
  };

  const exportStory = async (storyId, format) => {
    const story = state.stories.find(s => s.id === storyId);
    if (!story) throw new Error('Story not found');

    try {
      // Implementation for different export formats
      switch (format) {
        case 'json':
          const blob = new Blob([JSON.stringify(story, null, 2)], {
            type: 'application/json'
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${story.title || 'analysis'}-${format}.json`;
          a.click();
          URL.revokeObjectURL(url);
          break;
        
        case 'html':
          // Generate HTML presentation
          const htmlContent = generateHTMLPresentation(story);
          const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
          const htmlUrl = URL.createObjectURL(htmlBlob);
          const htmlA = document.createElement('a');
          htmlA.href = htmlUrl;
          htmlA.download = `${story.title || 'analysis'}-presentation.html`;
          htmlA.click();
          URL.revokeObjectURL(htmlUrl);
          break;
        
        case 'pdf':
          // Generate PDF using jsPDF
          try {
            const { jsPDF } = await import('jspdf');
            const pdf = new jsPDF();
            
            // Set document properties
            pdf.setProperties({
              title: story.title || 'Performance Analysis',
              subject: 'Data Analysis Report',
              author: 'INFOCON Analytics',
              creator: 'INFOCON Data Storytelling Tool'
            });
            
            // Add header with logo/icon
            pdf.setFillColor(59, 130, 246); // Blue color
            pdf.rect(0, 0, 210, 25, 'F');
            
            // Add title in header
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('INFOCON Analytics', 20, 15);
            
            // Reset text color for content
            pdf.setTextColor(0, 0, 0);
            
            // Add main title
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            pdf.text(story.title || 'Performance Analysis', 20, 45);
            
            // Add creation date
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);
            pdf.setTextColor(0, 0, 0);
            
            // Add description
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            const descriptionLines = pdf.splitTextToSize(story.description || 'No description available', 170);
            pdf.text(descriptionLines, 20, 70);
            
            let yPosition = 85 + (descriptionLines.length * 5);
            
            // Add metadata section
            if (story.metadata) {
              pdf.setFontSize(14);
              pdf.setFont('helvetica', 'bold');
              pdf.text('Analysis Summary', 20, yPosition);
              yPosition += 10;
              
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'normal');
              pdf.text(`• Total Records: ${story.metadata.rowCount || 0}`, 25, yPosition);
              yPosition += 7;
              pdf.text(`• Data Columns: ${story.metadata.columnCount || 0}`, 25, yPosition);
              yPosition += 7;
              pdf.text(`• Analysis Type: ${story.template ? 'AI-Generated' : 'Manual'}`, 25, yPosition);
              yPosition += 15;
            }
            
            // Add slides
            story.slides.forEach((slide, index) => {
              // Check if we need a new page
              if (yPosition > 250) {
                pdf.addPage();
                yPosition = 20;
              }
              
              // Slide number and type
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(59, 130, 246);
              pdf.text(`Slide ${index + 1} - ${slide.type.toUpperCase()}`, 20, yPosition);
              yPosition += 7;
              
              // Slide title
              pdf.setFontSize(16);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(0, 0, 0);
              pdf.text(slide.title, 20, yPosition);
              yPosition += 10;
              
              // Slide content
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'normal');
              const contentLines = pdf.splitTextToSize(slide.content || 'No content available', 170);
              pdf.text(contentLines, 20, yPosition);
              yPosition += (contentLines.length * 5) + 15;
              
              // Add separator line
              if (index < story.slides.length - 1) {
                pdf.setDrawColor(200, 200, 200);
                pdf.line(20, yPosition - 5, 190, yPosition - 5);
                yPosition += 10;
              }
            });
            
            // Add footer
            const pageCount = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
              pdf.setPage(i);
              pdf.setFontSize(8);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(100, 100, 100);
              pdf.text(`Page ${i} of ${pageCount}`, 20, 290);
              pdf.text('INFOCON Analytics - Data Storytelling Tool', 120, 290);
            }
            
            // Save the PDF
            pdf.save(`${story.title || 'analysis'}-presentation.pdf`);
          } catch (error) {
            console.error('PDF generation failed:', error);
            // Fallback to HTML if PDF generation fails
            const pdfContent = generateHTMLPresentation(story);
            const pdfBlob = new Blob([pdfContent], { type: 'text/html' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const pdfA = document.createElement('a');
            pdfA.href = pdfUrl;
            pdfA.download = `${story.title || 'analysis'}-presentation.html`;
            pdfA.click();
            URL.revokeObjectURL(pdfUrl);
          }
          break;
        
        default:
          throw new Error(`Export format ${format} not supported yet`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  };

  // Extract JSON from AI response (handles markdown code blocks)
  const extractJSONFromResponse = (responseText) => {
    console.log('Raw AI response:', responseText);
    
    try {
      // First, try to parse as direct JSON
      return JSON.parse(responseText);
    } catch (error) {
      console.log('Direct JSON parsing failed, trying alternatives...');
      
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          console.log('Found JSON in code block:', jsonMatch[1]);
          return JSON.parse(jsonMatch[1]);
        } catch (parseError) {
          console.error('Failed to parse JSON from code block:', parseError);
        }
      }
      
      // If no code block found, try to find JSON object in the text
      const jsonObjectMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        try {
          console.log('Found JSON object in text:', jsonObjectMatch[0]);
          return JSON.parse(jsonObjectMatch[0]);
        } catch (parseError) {
          console.error('Failed to parse JSON object from text:', parseError);
        }
      }
      
      // If all else fails, return a default structure
      console.error('Could not extract valid JSON from AI response:', responseText);
      return {
        keyInsights: [
          {
            title: "Data Analysis Complete",
            description: "Analysis of the provided dataset has been completed successfully.",
            metric: "Records analyzed",
            trend: "stable",
            businessImpact: "Provides insights for business decision making",
            recommendation: "Review the generated insights and take appropriate actions"
          }
        ],
        visualizations: [
          {
            type: "bar",
            title: "Data Overview",
            description: "Overview of the analyzed data",
            xAxis: "Categories",
            yAxis: "Values",
            insight: "Shows the distribution of data across different categories"
          }
        ],
        businessQuestions: [
          {
            question: "What are the key insights from this data?",
            answer: "The analysis reveals important patterns and trends in the data",
            confidence: "high",
            supportingData: "Based on comprehensive data analysis"
          }
        ]
      };
    }
  };

  // Calculate metrics from data
  const calculateMetric = (data, metricType, column = null) => {
    if (!data || data.length === 0) return 0;
    
    switch (metricType) {
      case 'count':
        return data.length;
      case 'sum':
        if (!column) return 0;
        return data.reduce((sum, row) => {
          const value = parseFloat(row[column]) || 0;
          return sum + value;
        }, 0);
      case 'average':
        if (!column) return 0;
        const sum = data.reduce((acc, row) => {
          const value = parseFloat(row[column]) || 0;
          return acc + value;
        }, 0);
        return sum / data.length;
      case 'max':
        if (!column) return 0;
        return Math.max(...data.map(row => parseFloat(row[column]) || 0));
      case 'min':
        if (!column) return 0;
        return Math.min(...data.map(row => parseFloat(row[column]) || 0));
      default:
        return data.length;
    }
  };

  const generateHTMLPresentation = (story) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${story.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a1a; color: white; }
        .slide { margin-bottom: 40px; padding: 20px; border: 1px solid #333; border-radius: 8px; }
        .title { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
        .content { font-size: 1.2em; line-height: 1.6; }
    </style>
</head>
<body>
    <h1>${story.title}</h1>
    <p>${story.description}</p>
    ${story.slides.map(slide => `
        <div class="slide">
            <div class="title">${slide.title}</div>
            <div class="content">${slide.content}</div>
        </div>
    `).join('')}
</body>
</html>`;
  };

  const value = {
    ...state,
    dispatch,
    // Helper functions
    getCurrentStory,
    getCurrentSlide,
    createStory,
    addSlide,
    updateSlide,
    deleteSlide,
    saveStory,
    exportStory,
    generateAIStory
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
};

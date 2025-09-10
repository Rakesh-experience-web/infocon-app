import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Brain, Lightbulb, TrendingUp, AlertTriangle, 
  CheckCircle, Target, BarChart3, Sparkles, Zap,
  Eye, Copy, Share, Download, Star
} from 'lucide-react';

const AIInsightsPanel = ({ insights, onClose }) => {
  const insightTypes = {
    positive: { icon: TrendingUp, color: 'text-green-400', bgColor: 'bg-green-500/20' },
    negative: { icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-500/20' },
    neutral: { icon: Target, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const renderInsightCard = (insight, index) => {
    const type = insightTypes[insight.type || 'neutral'];
    const Icon = type.icon;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white/10 rounded-lg border border-white/20 p-4 hover:bg-white/20 transition-all duration-300"
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${type.bgColor}`}>
            <Icon className={`w-5 h-5 ${type.color}`} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-2">{insight.title}</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{insight.description}</p>
            {insight.metric && (
              <div className="mt-3 p-2 bg-white/5 rounded border border-white/10">
                <div className="text-2xl font-bold text-white">{insight.metric}</div>
                <div className="text-xs text-gray-400">{insight.metricLabel}</div>
              </div>
            )}
          </div>
          <button
            onClick={() => copyToClipboard(insight.description)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
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
          className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="w-6 h-6 text-purple-400" />
                <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-white">AI Insights</h2>
              <span className="text-sm text-gray-400 bg-purple-500/20 px-2 py-1 rounded-full">
                Powered by Gemini
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {insights && Object.keys(insights).length > 0 ? (
              <div className="space-y-6">
                {/* Key Insights */}
                {insights.insights && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      Key Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {insights.insights.map((insight, index) => 
                        renderInsightCard(insight, index)
                      )}
                    </div>
                  </div>
                )}

                {/* Recommended Visualizations */}
                {insights.visualizations && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Recommended Visualizations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {insights.visualizations.map((viz, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/10 rounded-lg border border-white/20 p-4"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <BarChart3 className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{viz.type}</h4>
                              <p className="text-sm text-gray-400">{viz.description}</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-300">
                            <strong>Best for:</strong> {viz.bestFor}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Implications */}
                {insights.implications && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      Business Implications
                    </h3>
                    <div className="space-y-3">
                      {insights.implications.map((implication, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-white mb-1">{implication.title}</h4>
                            <p className="text-sm text-gray-300">{implication.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Quality */}
                {insights.quality && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-cyan-400" />
                      Data Quality Assessment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(insights.quality).map(([key, value], index) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/10 rounded-lg border border-white/20 p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-300 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < value ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(value / 5) * 100}%` }}
                            ></div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Recommended Actions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400 font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Create Data Story</h4>
                        <p className="text-sm text-gray-300">Use these insights to build a compelling narrative</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Share with Stakeholders</h4>
                        <p className="text-sm text-gray-300">Export and present your findings</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-green-400 font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Implement Recommendations</h4>
                        <p className="text-sm text-gray-300">Take action based on the insights</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No AI Insights Available</h3>
                <p className="text-gray-400">
                  Generate AI insights by creating a story with AI-powered templates
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/20 bg-white/5">
            <div className="text-sm text-gray-400">
              Insights generated using advanced AI analysis
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-md hover:bg-purple-500/30 transition-all duration-300 flex items-center gap-2">
                <Share className="w-4 h-4" />
                Share
              </button>
              <button className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-md hover:bg-blue-500/30 transition-all duration-300 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIInsightsPanel;

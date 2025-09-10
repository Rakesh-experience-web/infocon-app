import React from 'react';
import { Database, FileSpreadsheet, Code, Bot, ArrowRight, Upload, BookOpen } from 'lucide-react';

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

const MainDashboardPage = ({ onNavigate }) => {
    const features = [
        { id: 'excel', title: 'Excel & CSV Upload', description: 'Upload local files and analyze data with SQL.', icon: FileSpreadsheet, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
        { id: 'sheets', title: 'Google Sheets', description: 'Connect to Google Sheets and query data directly.', icon: Database, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
        { id: 'sql-query', title: 'SQL Query Editor', description: 'Run queries with the API and export results.', icon: Code, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
        { id: 'ai-chat', title: 'AI Chat Assistant', description: 'Ask questions in natural language to get SQL.', icon: Bot, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
        { id: 'storytelling', title: 'Data Storytelling', description: 'Turn insights into narratives and reports.', icon: BookOpen, color: 'text-orange-400', bgColor: 'bg-orange-500/10' }
    ];

    return (
        <Background>
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Header */}
                <header className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                        Data Intelligence <span className="text-emerald-400">Platform</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Connect your data, run powerful SQL queries, and generate insights with AI.
                    </p>
                </header>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <button
                                key={feature.id}
                                onClick={() => onNavigate(feature.id)}
                                className="group text-left rounded-lg border border-white/10 bg-black/30 p-6 hover:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`shrink-0 rounded-md ${feature.bgColor} p-3 transition-colors duration-300`}>
                                        <Icon className={`w-6 h-6 ${feature.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                                            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                        <p className="mt-1 text-sm text-gray-400">{feature.description}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    {/* Quick Upload Shortcut */}
                     <div className="rounded-lg border border-white/10 bg-black/30 p-6 md:col-span-2 lg:col-span-1 flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-2 text-white font-medium mb-3">
                            <Upload className="w-5 h-5 text-emerald-400" />
                            <span>Ready to Start?</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">Jump right in by uploading a CSV or Excel file.</p>
                        <button
                            onClick={() => onNavigate('excel')}
                            className="inline-flex items-center gap-2 rounded-md bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600/80 transition-colors"
                        >
                            Quick Upload
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </Background>
    );
};

export default MainDashboardPage;
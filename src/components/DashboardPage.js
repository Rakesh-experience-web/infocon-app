import React from 'react';
import { Database, Code, Table, Download, ChevronRight, Upload } from 'lucide-react';

// NOTE: To use the 'Unbounded' font, add the following line to the <head> of your public/index.html file:
// <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700&display=swap" rel="stylesheet">

// Background component for consistent styling
const Background = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#0D0D0D] text-gray-300 overflow-hidden" style={{ fontFamily: "'Unbounded', sans-serif" }}>
      <div className="absolute inset-0 z-0">
        {/* Animated background blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full mix-blend-lighten filter blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500/10 rounded-full mix-blend-lighten filter blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-lighten filter blur-2xl animate-pulse delay-2000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
            }}></div>
        </div>

        {/* Original radial gradient for top glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,242,169,0.15),rgba(255,255,255,0))]"></div>
        
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// --- Redesigned Placeholder Components ---

const DataSourceSelector = () => (
    <div className="space-y-8">
        <div className="bg-black/30 border border-gray-700/50 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4 text-lg">Upload Dataset</h3>
            <div className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300 border-gray-600 hover:border-[#00F2A9] hover:bg-[#00F2A9]/10">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-300">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-500 mt-1">CSV or XLSX file</p>
            </div>
        </div>
        <div className="bg-black/30 border border-gray-700/50 rounded-lg p-6 opacity-60">
            <h3 className="font-semibold text-white mb-4 text-lg">Select Dataset</h3>
            <div className="border border-gray-600 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Select a dataset...</p>
            </div>
        </div>
    </div>
);

const SQLQueryEditor = () => (
    <div className="bg-black/30 border border-gray-700/50 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4 text-lg flex items-center gap-2"><Code className="w-5 h-5 text-[#00F2A9]" /> SQL Query</h3>
        <div className="bg-gray-900/70 text-gray-300 p-4 rounded-lg font-mono text-sm h-48 border border-gray-600 focus-within:ring-2 focus-within:ring-[#00F2A9]">
            <textarea 
                className="w-full h-full bg-transparent outline-none resize-none"
                defaultValue="SELECT * FROM your_table LIMIT 100;"
            />
        </div>
    </div>
);

const DataTable = () => (
     <div className="bg-black/30 border border-gray-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-lg flex items-center gap-2"><Table className="w-5 h-5 text-[#00F2A9]" /> Query Result</h3>
            <ExportOptions />
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-700">
                        <th className="px-4 py-2 text-left font-bold text-[#00F2A9]">id</th>
                        <th className="px-4 py-2 text-left font-bold text-[#00F2A9]">product_name</th>
                        <th className="px-4 py-2 text-left font-bold text-[#00F2A9]">price</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-4 py-2">1</td>
                        <td className="px-4 py-2">Quantum Widget</td>
                        <td className="px-4 py-2">$99.99</td>
                    </tr>
                     <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-4 py-2">2</td>
                        <td className="px-4 py-2">Hyper Sprocket</td>
                        <td className="px-4 py-2">$149.50</td>
                    </tr>
                     <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-4 py-2">3</td>
                        <td className="px-4 py-2">Nano Gear</td>
                        <td className="px-4 py-2">$24.75</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

const ExportOptions = () => (
    <div className="flex space-x-2">
         <button className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-800/50 border border-gray-600 rounded-md text-center hover:border-[#00F2A9] hover:text-white transition-all">
            <Download className="w-3 h-3"/>
            <span>CSV</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-800/50 border border-gray-600 rounded-md text-center hover:border-[#00F2A9] hover:text-white transition-all">
            <Download className="w-3 h-3"/>
            <span>JSON</span>
        </button>
    </div>
);


const DashboardPage = () => {
  return (
    <Background>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">The Next Frontier of <span className="text-[#00F2A9]">Data Intelligence</span></h1>
          <p className="text-gray-400 mt-2">Connect, query, and visualize your data with ease.</p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-1">
            <DataSourceSelector />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            <SQLQueryEditor />
             <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00F2A9] text-black font-bold rounded-lg hover:bg-white disabled:opacity-50 transition-all duration-300 shadow-[0_0_15px_rgba(0,242,169,0.5)]">
                <span>Execute Query</span>
                <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="mt-8">
            <DataTable />
        </div>
      </div>
    </Background>
  );
};

export default DashboardPage;


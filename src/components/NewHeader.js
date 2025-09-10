import React from 'react';
import { Home, Database, FileSpreadsheet, Settings, Bot, BookOpen, Code, ArrowRight } from 'lucide-react';

const NewHeader = ({ activePage, setActivePage }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'excel', label: 'Excel/CSV', icon: FileSpreadsheet },
    { id: 'sheets', label: 'Google Sheets', icon: Database },
    { id: 'sql-query', label: 'SQL Query', icon: Code },
    { id: 'ai-chat', label: 'AI Chat', icon: Bot },
    { id: 'storytelling', label: 'Storytelling', icon: BookOpen },
    { id: 'api-guide', label: 'API Guide', icon: Code }
  ];

  return (
    <header className="bg-black/80 backdrop-blur-md border-b border-green-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'Unbounded, Arial, sans-serif' }}>
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                INFOCON
              </span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'text-gray-300 hover:text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">{item.label}</span>
                  {isActive && <ArrowRight className="w-3 h-3" />}
                </button>
              );
            })}
          </nav>

          {/* Settings */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-300 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-300">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NewHeader;

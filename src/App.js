import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './components/LandingPage';
import MainDashboardPage from './components/MainDashboardPage';
import GoogleSheetsPage from './components/GoogleSheetsPage';
import ExcelPage from './components/ExcelPage';
import AIChatPage from './components/AIChatPage';
import DataStorytelling from './components/DataStorytelling';
import APIIntegrationGuide from './components/APIIntegrationGuide';
import SQLQueryPageAPI from './components/SQLQueryPageAPI';
import NewHeader from './components/NewHeader';
import { DataProvider } from './context/DataContext';
import { StoryProvider } from './context/StoryContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleGetStarted = () => {
    setCurrentPage('dashboard');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  return (
    <DataProvider>
      <StoryProvider>
        <div className="min-h-screen bg-black relative overflow-hidden">
          {/* Futuristic Background Elements */}
          <div className="absolute inset-0">
            {/* Glowing Light Source - Top Right */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-green-400/20 via-green-500/15 to-transparent rounded-full mix-blend-screen filter blur-3xl"></div>
            
            {/* Diagonal Light Effect */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-green-400/8 via-transparent to-transparent transform rotate-12"></div>
            
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.1) 50%, transparent 100%),
                  linear-gradient(0deg, transparent 0%, rgba(34,197,94,0.1) 50%, transparent 100%)
                `,
                backgroundSize: '100px 100px, 100px 100px'
              }}></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-20 left-20 w-2 h-2 bg-green-400/40 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-40 w-1 h-1 bg-green-400/30 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-1.5 h-1.5 bg-green-400/35 rounded-full animate-pulse delay-2000"></div>
            <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-green-400/25 rounded-full animate-pulse delay-1500"></div>
          </div>

          {/* Header - only show on dashboard pages */}
          {currentPage !== 'home' && (
            <NewHeader
              activePage={currentPage}
              setActivePage={handlePageChange}
            />
          )}

          {/* Main Content */}
          <main className="relative z-10">
            {currentPage === 'home' && (
              <LandingPage onGetStarted={handleGetStarted} />
            )}
            {currentPage === 'dashboard' && (
              <MainDashboardPage onNavigate={handleNavigate} />
            )}
            {currentPage === 'sheets' && (
              <GoogleSheetsPage onBack={handleBackToDashboard} />
            )}
            {currentPage === 'excel' && (
              <ExcelPage onBack={handleBackToDashboard} />
            )}
            {currentPage === 'ai-chat' && (
              <AIChatPage onBack={handleBackToDashboard} />
            )}
            {currentPage === 'storytelling' && (
              <DataStorytelling onBack={handleBackToDashboard} />
            )}
            {currentPage === 'api-guide' && (
              <APIIntegrationGuide onBack={handleBackToDashboard} />
            )}
            {currentPage === 'sql-query' && (
              <SQLQueryPageAPI />
            )}
          </main>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: 'white'
            }}
          />
        </div>
      </StoryProvider>
    </DataProvider>
  );
}

export default App;

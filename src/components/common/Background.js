import React from 'react';

const Background = ({ children }) => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
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
      
      {/* Page Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Background;

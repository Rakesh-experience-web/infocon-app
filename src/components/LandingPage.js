import React from 'react';
import { ArrowRight, Database, FileSpreadsheet, Brain, Zap, Globe, ChevronDown } from 'lucide-react';
import robotImage from '../assets/Gemini_Generated_Image_mj50d8mj50d8mj50.png';
import logoImage from '../assets/logo.png';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Large Robot Background - AI Generated Image */}
      <div className="absolute inset-0 z-0 flex items-center justify-end pr-8">
        <img 
          src={robotImage} 
          alt="AI Robot with Holographic Interfaces" 
          className="h-[85vh] w-auto object-contain opacity-90"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.1)) brightness(1.1) contrast(1.2)',
            mixBlendMode: 'multiply'
          }}
        />
      </div>

             {/* Header */}
       <header className="relative z-10 flex justify-between items-center px-8 py-6">
         {/* Logo */}
         <div className="flex items-center space-x-3">
           <span className="text-white font-bold text-lg tracking-wider uppercase" style={{ fontFamily: 'Unbounded, Arial, sans-serif', letterSpacing: '0.05em' }}>
             INFOCON
           </span>
         </div>

         {/* Start Button */}
         <button
           onClick={onGetStarted}
           className="relative group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105"
           style={{
             boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(147, 51, 234, 0.3)',
           }}
         >
           {/* Holographic effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
           
           {/* Glow effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
           
           {/* Button content */}
           <span className="relative z-10 text-white font-semibold tracking-wider uppercase text-sm">
             Start
           </span>
         </button>
       </header>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-200px)]">
        {/* Left Side - Content */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12">
          {/* Subtitle */}
          <div className="text-white text-sm uppercase tracking-widest mb-4 opacity-70">
            AI-POWERED DATA ANALYSIS
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight uppercase" style={{ fontFamily: 'Unbounded, Arial, sans-serif', letterSpacing: '0.05em' }}>
            <span className="block">Transform Your Data</span>
            <span className="block">With SQL Intelligence</span>
          </h1>

                     {/* Call to Action - Removed since we have the Start button in header */}

                     {/* Scroll Indicator */}
           <div className="flex items-center space-x-3 text-white/60 text-sm">
             <span className="text-lg">*</span>
             <span className="tracking-widest uppercase">Scroll Down to Discover More</span>
           </div>
        </div>

                 {/* Right Side - Empty for robot image */}
         <div className="flex-1 relative flex items-center justify-center px-8 py-12">
         </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/5 backdrop-blur-sm border-t border-white/10 z-20">
        <div className="flex justify-around">
          <div className="flex items-center space-x-2 py-4 px-6 text-white hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <div className="w-2 h-2 bg-white"></div>
            <span className="text-sm tracking-wider">Data Import</span>
          </div>
          <div className="flex items-center space-x-2 py-4 px-6 text-white hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <div className="w-2 h-2 bg-white"></div>
            <span className="text-sm tracking-wider">SQL Query</span>
          </div>
          <div className="flex items-center space-x-2 py-4 px-6 text-white hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <div className="w-2 h-2 bg-white"></div>
            <span className="text-sm tracking-wider">AI Assistant</span>
          </div>
          <div className="flex items-center space-x-2 py-4 px-6 text-white hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <div className="w-2 h-2 bg-white"></div>
            <span className="text-sm tracking-wider">Export Results</span>
          </div>
        </div>
      </div>

      {/* Additional floating geometric elements */}
      <div className="absolute top-1/4 left-10 w-16 h-16 border border-white/10 rotate-45 animate-pulse z-10"></div>
      <div className="absolute bottom-1/4 right-20 w-12 h-12 border border-white/15 rotate-12 animate-pulse z-10" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/3 w-8 h-8 border border-white/20 rotate-90 animate-pulse z-10" style={{animationDelay: '4s'}}></div>
    </div>
  );
};

export default LandingPage;

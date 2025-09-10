import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, Pause, SkipBack, SkipForward, Fullscreen, 
  Download, Share, Settings, ChevronLeft, ChevronRight,
  Maximize2, Minimize2, Volume2, VolumeX
} from 'lucide-react';
import ChartRenderer from './ChartRenderer';

const StoryPreview = ({ story, onClose, onExport }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [presentationSpeed, setPresentationSpeed] = useState(3000);
  const [isMuted, setIsMuted] = useState(false);
  
  const currentSlide = story.slides[currentSlideIndex];

  useEffect(() => {
    let interval;
    if (isPlaying && story.slides.length > 1) {
      interval = setInterval(() => {
        setCurrentSlideIndex((prev) => 
          prev === story.slides.length - 1 ? 0 : prev + 1
        );
      }, presentationSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, story.slides.length, presentationSpeed]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'Escape':
          if (isFullscreen) setIsFullscreen(false);
          break;
        case 'f':
          setIsFullscreen(!isFullscreen);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isFullscreen]);

  const handlePrevious = () => {
    setCurrentSlideIndex((prev) => 
      prev === 0 ? story.slides.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => 
      prev === story.slides.length - 1 ? 0 : prev + 1
    );
  };

  const handleSlideClick = (index) => {
    setCurrentSlideIndex(index);
  };

  const renderSlide = (slide) => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white mb-6"
            >
              {slide.title}
            </motion.h1>
            {slide.subtitle && (
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl text-gray-300 mb-8"
              >
                {slide.subtitle}
              </motion.h2>
            )}
            {slide.content && (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-400 max-w-3xl leading-relaxed"
              >
                {slide.content}
              </motion.p>
            )}
          </div>
        );

      case 'chart':
        return (
          <div className="h-full flex flex-col">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-6 text-center"
            >
              {slide.title}
            </motion.h2>
            <div className="flex-1 flex items-center justify-center">
              <ChartRenderer
                data={story.dataSource}
                config={slide.config}
                height={400}
              />
            </div>
            {slide.content && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-300 mt-6 text-center max-w-2xl mx-auto"
              >
                {slide.content}
              </motion.p>
            )}
          </div>
        );

      case 'metric':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-8"
            >
              {slide.title}
            </motion.h2>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-8xl font-bold text-blue-400 mb-6"
            >
              {(() => {
                if (!slide.config?.target) return 'N/A';
                const values = story.dataSource.map(row => 
                  parseFloat(row[slide.config.target])
                ).filter(v => !isNaN(v));
                
                switch (slide.config.metric) {
                  case 'count': return values.length;
                  case 'sum': return values.reduce((a, b) => a + b, 0).toFixed(0);
                  case 'average': return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
                  case 'min': return Math.min(...values).toFixed(2);
                  case 'max': return Math.max(...values).toFixed(2);
                  default: return 'N/A';
                }
              })()}
            </motion.div>
            {slide.content && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-gray-300 max-w-2xl"
              >
                {slide.content}
              </motion.p>
            )}
          </div>
        );

      case 'insight':
        const insightColors = {
          positive: 'text-green-400',
          negative: 'text-red-400',
          neutral: 'text-blue-400',
          warning: 'text-yellow-400'
        };
        
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-6"
            >
              {slide.title}
            </motion.h2>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className={`text-8xl mb-8 ${insightColors[slide.config?.type || 'neutral']}`}
            >
              💡
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl text-gray-300 max-w-3xl leading-relaxed"
            >
              {slide.content}
            </motion.p>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-6"
            >
              {slide.title}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-300 max-w-3xl leading-relaxed"
            >
              {slide.content}
            </motion.p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black z-50 ${isFullscreen ? '' : 'p-6'}`}
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Presentation Area */}
        <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
          {/* Slide Content */}
          <div className="w-full h-full">
            {currentSlide ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full"
                >
                  {renderSlide(currentSlide)}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <div className="text-xl">No slides to preview</div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Overlay */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
              >
                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentSlideIndex + 1) / story.slides.length) * 100}%` }}
                  ></div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePrevious}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <SkipBack className="w-6 h-6" />
                    </button>
                    
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    
                    <button
                      onClick={handleNext}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <SkipForward className="w-6 h-6" />
                    </button>

                    <span className="text-white text-sm">
                      {currentSlideIndex + 1} / {story.slides.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                    
                    <button
                      onClick={() => onExport('html')}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={onClose}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slide Thumbnails */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-4 max-h-96 overflow-y-auto"
              >
                <div className="space-y-2">
                  {story.slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => handleSlideClick(index)}
                      className={`w-20 h-12 rounded border-2 transition-all duration-300 ${
                        index === currentSlideIndex
                          ? 'border-orange-500 bg-orange-500/20'
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      <div className="text-xs text-white truncate px-1">
                        {slide.title}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Story Info */}
          <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-white font-semibold">{story.title}</h3>
            <p className="text-gray-400 text-sm">{story.description}</p>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
            <div className="space-y-1">
              <div>← → Navigate</div>
              <div>Space Play/Pause</div>
              <div>F Fullscreen</div>
              <div>ESC Exit</div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryPreview;

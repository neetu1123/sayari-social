'use client';

import React from 'react';
import { useMoodTheme } from './MoodThemeContext';
import Navbar from './Navbar';
import ParticleCanvas from './ParticleCanvas';

export const LayoutWrapper = ({ children }) => {
  const { themeStyles } = useMoodTheme();

  return (
    <div 
      className={`min-h-screen flex flex-col transition-all duration-700 bg-gradient-to-b ${themeStyles.gradient} ${themeStyles.fontClass} text-white`}
    >
      <Navbar />
      <ParticleCanvas />
      
      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-8 border-t border-white/5 bg-black/30 text-center text-xs text-gray-500 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-gray-400 mb-1">SAYARI.SOCIAL</p>
          <p className="mb-3">Craft poetry, compose emotions, share your signature style.</p>
          <p>&copy; {new Date().getFullYear()} Sayari.Social. Designed for deep emotional expression.</p>
        </div>
      </footer>
    </div>
  );
};
export default LayoutWrapper;

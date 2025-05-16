'use client';

import { Suspense, useState } from 'react';
import ScienceScene from '@/components/three/ScienceScene';
import ScienceContent from '@/components/ScienceContent';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client-provider';

export default function Home() {
  const [explorationMode, setExplorationMode] = useState(false);
  
  const toggleExplorationMode = () => {
    setExplorationMode(!explorationMode);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen relative">
        {/* Three.js Background */}
        <div className="fixed inset-0 z-0">
          <Suspense fallback={<div className="w-full h-full bg-black"></div>}>
            <ScienceScene />
          </Suspense>
        </div>
        
        {/* Exploration Mode Toggle */}
        <button
          onClick={toggleExplorationMode}
          className="fixed bottom-4 right-4 z-50 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-full transition-colors text-sm flex items-center gap-2"
        >
          {explorationMode ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Exit Exploration
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Explore Universe
            </>
          )}
        </button>
        
        {/* Content - only visible when not in exploration mode */}
        {!explorationMode && (
          <div className="relative z-10">
            {/* Hero Section */}
            <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
              <div className="z-10 text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  Discover the Wonders of Science
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 drop-shadow-md">
                  Explore the latest scientific discoveries and exhibitions that shape our understanding of the universe.
                </p>
                <button 
                  onClick={toggleExplorationMode}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-colors"
                >
                  Explore 3D Universe
                </button>
              </div>
            </section>
            
            {/* Science Facts Section */}
            <section className="py-16 px-4 max-w-7xl mx-auto bg-black/70 backdrop-blur-md text-white">
              <ScienceContent />
            </section>
            
        
            
            {/* Footer */}
            <footer className="py-10 px-4 bg-black/80 backdrop-blur-md border-t border-gray-700">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <p className="text-gray-400">&copy; 2025 Science Exhibitions. All rights reserved.</p>
                </div>
                
                <div className="flex gap-6">
                  <a href="#" className="text-gray-400 hover:text-indigo-400">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-gray-400 hover:text-indigo-400">
                    Terms of Service
                  </a>
                  <a href="#" className="text-gray-400 hover:text-indigo-400">
                    Contact Us
                  </a>
                </div>
              </div>
            </footer>
          </div>
        )}
        
        {/* Instructions overlay only visible in exploration mode */}
        {explorationMode && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-black/70 text-white p-4 rounded-lg text-center max-w-lg">
            <h3 className="font-bold mb-2">Interactive Universe Mode</h3>
            <p>Use WASD keys to move around. Find and click on atoms to discover scientific secrets!</p>
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { RobotPart } from '../types';

interface SidebarProps {
  selectedPart: RobotPart | null;
  isVisible: boolean;
}

const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex++;
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      <span className="animate-pulse text-cyan-400 font-bold">_</span>
    </span>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ selectedPart, isVisible }) => {
  return (
    <aside className={`w-full md:w-1/3 lg:w-1/4 h-full flex flex-col bg-slate-950/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 transition-all duration-500 ease-in-out transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
      <div className="flex-grow overflow-y-auto pr-2">
        <h2 className="text-3xl font-bold text-cyan-300 border-b-2 border-cyan-300/30 pb-2">SYSTEM DIAGNOSTICS</h2>
        
        {selectedPart ? (
          <div className="mt-6 font-mono text-slate-300 animate-fade-in">
            <div className="mb-6">
              <p className="text-base text-slate-400 tracking-widest mb-1">COMPONENT</p>
              <h3 className="text-3xl font-bold text-white">{selectedPart.name}</h3>
            </div>
            <div className="mb-6">
              <p className="text-base text-slate-400 tracking-widest mb-1">BASE FUNCTION</p>
              <div className="text-xl text-slate-200 leading-relaxed min-h-[4rem]">
                 <TypewriterText text={selectedPart.description} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10 text-center text-slate-500 font-mono text-lg">
            <p className="mb-2">// NO COMPONENT SELECTED</p>
            <p>Awaiting user input...</p>
            <p>Hover over or click a robot part to analyze.</p>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-slate-700 pt-4 mt-6">
        <div>
          <p className="font-mono text-base text-slate-400">OPERATOR</p>
          <p className="text-xl font-bold text-slate-200">ZUNAIRA SOOMRO</p>
          <p className="text-sm text-slate-500">CLASS 8-B</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
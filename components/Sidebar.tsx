import React, { useState, useEffect } from 'react';
import { RobotPart } from '../types';
import { LoaderIcon } from './icons';

/**
 * A custom hook for creating a typewriter effect.
 * @param text The full text to be typed.
 * @param speed The speed in milliseconds between characters.
 * @returns An object containing the currently typed text and a boolean indicating if typing is in progress.
 */
const useTypewriter = (text: string, speed: number = 25) => {
    const [typedText, setTypedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        setTypedText('');
        if (text) {
            setIsTyping(true);
            let i = 0;
            const typingInterval = setInterval(() => {
                if (i < text.length) {
                    setTypedText(prev => prev + text.charAt(i));
                    i++;
                } else {
                    clearInterval(typingInterval);
                    setIsTyping(false);
                }
            }, speed);

            return () => {
                clearInterval(typingInterval);
                setIsTyping(false);
            };
        }
    }, [text, speed]);

    return { typedText, isTyping };
};


interface SidebarProps {
  selectedPart: RobotPart | null;
  geminiDescription: string;
  isLoading: boolean;
  isVisible: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedPart, geminiDescription, isLoading, isVisible }) => {
  const { typedText, isTyping } = useTypewriter(geminiDescription, 20);
  
  const renderDescription = () => {
    return (
        <div className="text-xl text-slate-200 mt-2 min-h-[8rem] leading-relaxed">
            <p>
                {typedText}
                {isTyping && <span className="blinking-cursor">▋</span>}
            </p>
        </div>
    );
  };


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
              <p className="text-xl text-slate-200 leading-relaxed">{selectedPart.description}</p>
            </div>
            <div>
              <div className="flex justify-between items-center">
                  <p className="text-base text-slate-400 tracking-widest">AI-ENHANCED ANALYSIS</p>
              </div>
              {isLoading ? (
                <div className="flex items-center space-x-2 mt-2">
                  <LoaderIcon className="w-6 h-6 animate-spin text-cyan-400" />
                  <p className="text-lg">ACCESSING DATABASE...</p>
                </div>
              ) : (
                renderDescription()
              )}
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
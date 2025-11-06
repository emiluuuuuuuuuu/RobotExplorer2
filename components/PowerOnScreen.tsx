import React from 'react';
import { PowerIcon } from './icons';

interface PowerOnScreenProps {
  onPowerOn: () => void;
  isPoweringOn: boolean;
}

const PowerOnScreen: React.FC<PowerOnScreenProps> = ({ onPowerOn, isPoweringOn }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full transition-opacity duration-300">
      <div className={`text-center transition-all duration-300 ${isPoweringOn ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
        <h1 className="text-5xl md:text-7xl font-extrabold text-cyan-300 tracking-wider">
          ROBOT EXPLORER
        </h1>
        <p className="text-slate-400 mt-2 text-lg">SYSTEM STANDBY</p>
      </div>

      <button
        onClick={onPowerOn}
        className={`group relative mt-16 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out ${
          isPoweringOn
            ? 'w-full h-screen !rounded-none bg-cyan-400'
            : 'w-40 h-40 bg-slate-800 border-4 border-slate-700 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(56,189,248,0.5)]'
        }`}
        aria-label="Power On Robot"
      >
        {!isPoweringOn && (
          <>
            <PowerIcon className="w-16 h-16 text-slate-600 group-hover:text-cyan-400 transition-colors duration-200" />
            <span className="absolute -bottom-10 text-slate-400 group-hover:text-white transition-colors duration-200 font-bold tracking-widest">
              POWER ON
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default PowerOnScreen;
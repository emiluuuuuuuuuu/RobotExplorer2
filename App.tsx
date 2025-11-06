import React, { useState, useEffect } from 'react';
import PowerOnScreen from './components/PowerOnScreen';
import RobotExplorer from './components/RobotExplorer';

const App: React.FC = () => {
  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(false);
  const [showExplorer, setShowExplorer] = useState<boolean>(false);

  const handlePowerOn = () => {
    setIsPoweredOn(true);
    // Delay showing the explorer for the animation to complete
    setTimeout(() => {
      setShowExplorer(true);
    }, 250);
  };
  
  return (
    <div className="text-slate-100 min-h-screen w-full transition-colors duration-500">
      {!showExplorer ? (
        <PowerOnScreen onPowerOn={handlePowerOn} isPoweringOn={isPoweredOn} />
      ) : (
        <RobotExplorer />
      )}
    </div>
  );
};

export default App;
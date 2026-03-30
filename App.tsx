import React, { useState, useCallback } from 'react';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [planetScale, setPlanetScale] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [focusedPlanet, setFocusedPlanet] = useState('Soleil');

  const resetDefaults = useCallback(() => {
    setTimeSpeed(1);
    setPlanetScale(1);
    setShowOrbits(true);
    setFocusedPlanet('Soleil');
  }, []);

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden select-none">
      <div className="absolute inset-0 z-0">
        <Scene 
          timeSpeed={timeSpeed}
          planetScale={planetScale}
          showOrbits={showOrbits}
          focusedPlanet={focusedPlanet}
        />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        <UIOverlay 
          timeSpeed={timeSpeed}
          setTimeSpeed={setTimeSpeed}
          planetScale={planetScale}
          setPlanetScale={setPlanetScale}
          showOrbits={showOrbits}
          setShowOrbits={setShowOrbits}
          focusedPlanet={focusedPlanet}
          setFocusedPlanet={setFocusedPlanet}
          onReset={resetDefaults}
        />
      </div>
    </div>
  );
};

export default App;

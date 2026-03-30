import React, { useState, useEffect, useCallback } from 'react';
import { Settings, X, Eye, EyeOff, RotateCcw, Volume2 } from 'lucide-react';

interface UIOverlayProps {
  timeSpeed: number;
  setTimeSpeed: (val: number) => void;
  planetScale: number;
  setPlanetScale: (val: number) => void;
  showOrbits: boolean;
  setShowOrbits: (val: boolean) => void;
  focusedPlanet: string;
  setFocusedPlanet: (val: string) => void;
  onReset: () => void;
}

const planetData: Record<string, { emoji: string, fact: string, color: string }> = {
  'Soleil': { emoji: '🌞', fact: "C'est une étoile géante très chaude qui nous donne de la lumière !", color: "bg-yellow-400" },
  'Mercure': { emoji: '🪨', fact: "La planète la plus proche du Soleil. Il y fait très chaud le jour et très froid la nuit !", color: "bg-gray-400" },
  'Vénus': { emoji: '☁️', fact: "Elle brille très fort dans le ciel, on l'appelle l'étoile du berger. Elle est recouverte de nuages !", color: "bg-orange-300" },
  'Terre': { emoji: '🌍', fact: "Notre belle maison ! C'est la seule planète avec de la vie, des animaux et beaucoup d'eau.", color: "bg-blue-400" },
  'Mars': { emoji: '🔴', fact: "La planète rouge ! Elle a de grands volcans et des robots roulent dessus pour l'explorer.", color: "bg-red-500" },
  'Jupiter': { emoji: '🟠', fact: "La plus grosse planète ! Elle est faite de gaz et a une énorme tempête qui tourne tout le temps.", color: "bg-orange-500" },
  'Saturne': { emoji: '🪐', fact: "La planète avec les magnifiques anneaux ! Ils sont faits de morceaux de glace et de cailloux.", color: "bg-yellow-200" },
  'Uranus': { emoji: '🧊', fact: "Une planète géante de glace qui tourne sur le côté, comme un tonneau !", color: "bg-cyan-300" },
  'Neptune': { emoji: '❄️', fact: "La planète la plus éloignée. Elle est très froide et il y a des vents très très forts !", color: "bg-blue-600" },
  'Pluton': { emoji: '⛄', fact: "Une toute petite planète naine, très loin et recouverte de glace !", color: "bg-gray-300" },
  'Nibiru': { emoji: '👁️', fact: "La mystérieuse 10ème planète ! C'est une légende fascinante de l'espace.", color: "bg-red-900" }
};

const UIOverlay: React.FC<UIOverlayProps> = ({
  timeSpeed, setTimeSpeed,
  planetScale, setPlanetScale,
  showOrbits, setShowOrbits,
  focusedPlanet, setFocusedPlanet,
  onReset,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  // Hide scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      @keyframes popIn {
        0% { opacity: 0; transform: translate(-50%, -40%) scale(0.8); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      .animate-pop-in {
        animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.85; // Slower for kids
      utterance.pitch = 1.2; // Friendly voice
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    const textToSpeak = `${focusedPlanet}. ${planetData[focusedPlanet].fact}`;
    speakText(textToSpeak);
  }, [focusedPlanet, speakText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="flex flex-col justify-between h-full w-full pointer-events-none">
      
      {/* Top Bar */}
      <div className="flex justify-between items-start p-4 md:p-6 pointer-events-auto">
        <div className="bg-black/50 backdrop-blur-md border border-white/20 px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg flex items-center gap-2 md:gap-3">
          <span className="text-xl md:text-2xl">🚀</span>
          <h1 className="font-['Space_Grotesk'] text-lg md:text-2xl font-bold text-white tracking-wide">
            Mon Système Solaire
          </h1>
        </div>
        
        <button 
          onClick={() => setShowSettings(true)}
          className="bg-black/50 backdrop-blur-md border border-white/20 p-2 md:p-3 rounded-full shadow-lg text-white hover:bg-white/20 transition-colors"
        >
          <Settings size={24} className="md:w-7 md:h-7" />
        </button>
      </div>

      {/* Removed Center Info Card */}

      {/* Bottom Planet Selector */}
      <div className="w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-6 pt-16 px-2 pointer-events-auto">
        <div className="flex overflow-x-auto gap-3 md:gap-6 snap-x snap-mandatory hide-scrollbar items-end px-4 md:justify-center">
          {Object.entries(planetData).map(([name, data]) => {
            const isSelected = focusedPlanet === name;
            return (
              <button
                key={name}
                onClick={() => { 
                  setFocusedPlanet(name); 
                }}
                className={`snap-center shrink-0 flex flex-col items-center transition-all duration-300 ease-out outline-none
                  ${isSelected ? 'scale-110 -translate-y-4' : 'scale-90 opacity-70 hover:opacity-100 hover:scale-100'}
                `}
              >
                <div className={`
                  w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl md:text-4xl shadow-lg border-4 transition-colors
                  ${isSelected ? 'border-white bg-white/20' : 'border-transparent bg-black/40'} 
                `}>
                  {data.emoji}
                </div>
                <span className={`mt-3 font-bold px-3 py-1 rounded-full transition-colors
                  ${isSelected ? 'bg-white text-black text-base md:text-lg shadow-md' : 'text-white text-sm bg-black/50'}
                `}>
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 border-4 border-blue-500/50 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-pop-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Settings className="text-blue-400" size={32} /> 
                Réglages
              </h2>
              <button 
                onClick={() => setShowSettings(false)} 
                className="text-white/50 hover:text-white bg-white/10 rounded-full p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Speed */}
            <div className="mb-8 bg-black/40 p-5 rounded-2xl border border-white/5">
              <label className="text-white font-bold mb-4 flex justify-between items-center text-lg">
                <span>Vitesse du temps</span>
              </label>
              <div className="flex items-center gap-4">
                <span className="text-3xl" title="Lent">🐢</span>
                <input 
                  type="range" min="0" max="10" step="0.1" 
                  value={timeSpeed} 
                  onChange={(e) => setTimeSpeed(parseFloat(e.target.value))} 
                  className="flex-1 h-4 bg-gray-700 rounded-full appearance-none accent-blue-500 cursor-pointer" 
                />
                <span className="text-3xl" title="Rapide">🐇</span>
              </div>
            </div>

            {/* Size */}
            <div className="mb-8 bg-black/40 p-5 rounded-2xl border border-white/5">
              <label className="text-white font-bold mb-4 flex justify-between items-center text-lg">
                <span>Taille des planètes</span>
              </label>
              <div className="flex items-center gap-4">
                <span className="text-2xl" title="Petit">🐜</span>
                <input 
                  type="range" min="1" max="10" step="0.1" 
                  value={planetScale} 
                  onChange={(e) => setPlanetScale(parseFloat(e.target.value))} 
                  className="flex-1 h-4 bg-gray-700 rounded-full appearance-none accent-purple-500 cursor-pointer" 
                />
                <span className="text-3xl" title="Grand">🐘</span>
              </div>
            </div>

            {/* Orbits */}
            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex justify-between items-center mb-8">
              <label className="text-white font-bold flex items-center gap-3 text-lg">
                {showOrbits ? <Eye className="text-cyan-400" size={24}/> : <EyeOff className="text-gray-500" size={24}/>}
                Lignes des orbites
              </label>
              <button 
                onClick={() => setShowOrbits(!showOrbits)} 
                className={`w-16 h-10 rounded-full transition-colors relative shadow-inner ${showOrbits ? 'bg-cyan-500' : 'bg-gray-600'}`}
              >
                <div className={`w-8 h-8 bg-white rounded-full absolute top-1 transition-transform shadow-md ${showOrbits ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <button 
              onClick={() => { onReset(); setShowSettings(false); }}
              className="w-full py-4 rounded-xl font-bold text-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Remettre à zéro
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;

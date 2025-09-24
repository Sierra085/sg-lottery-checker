import React from 'react';

type GameMode = 'toto' | '4d';

interface GameModeSwitcherProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
}

export const GameModeSwitcher: React.FC<GameModeSwitcherProps> = ({ gameMode, setGameMode }) => {
  const getButtonClasses = (mode: GameMode) => {
    const baseClasses = 'w-full py-3 text-xl font-bold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500';
    if (gameMode === mode) {
      return `${baseClasses} bg-red-600 text-white shadow-md`;
    }
    return `${baseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`;
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-2 bg-gray-100 rounded-xl mb-6">
      <button 
        onClick={() => setGameMode('toto')} 
        className={getButtonClasses('toto')}
        aria-pressed={gameMode === 'toto'}
      >
        TOTO
      </button>
      <button 
        onClick={() => setGameMode('4d')} 
        className={getButtonClasses('4d')}
        aria-pressed={gameMode === '4d'}
      >
        4D
      </button>
    </div>
  );
};

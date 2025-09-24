import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LightbulbIcon, CloseIcon } from './IconComponents';

export const Onboarding: React.FC = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage('hasSeenLotteryOnboarding', false);
  const [isOpen, setIsOpen] = useState(!hasSeenOnboarding);

  const handleClose = () => {
    setIsOpen(false);
    setHasSeenOnboarding(true);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md mb-6 relative">
      <div className="flex">
        <div className="py-1">
          <LightbulbIcon className="w-8 h-8 text-blue-500" />
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-bold">How to Use</h3>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-lg">
            <li>Select <strong>TOTO</strong> or <strong>4D</strong> game mode.</li>
            <li>Tap <strong>Scan Ticket</strong> to open your camera.</li>
            <li>Take a clear, flat photo of your ticket.</li>
            <li>Confirm the scanned numbers are correct.</li>
            <li>See your results instantly!</li>
          </ol>
        </div>
      </div>
      <button onClick={handleClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-blue-200">
        <CloseIcon className="w-6 h-6" />
      </button>
    </div>
  );
};
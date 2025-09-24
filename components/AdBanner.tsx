import React from 'react';

export const AdBanner: React.FC = () => {
  return (
    <div className="relative bg-gray-100 p-2 border-b border-gray-200">
      <a 
        href="#" 
        onClick={(e) => e.preventDefault()} 
        className="flex items-center space-x-3"
        aria-label="Advertisement"
      >
        <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center">
             <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <div className="flex-grow">
          <p className="text-sm font-bold text-gray-800">Lightning Fast Web Hosting</p>
          <p className="text-xs text-gray-600">Powerful performance at an unbeatable price. Get 80% off!</p>
        </div>
        <div className="flex-shrink-0">
          <button className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors">
            Get Offer
          </button>
        </div>
      </a>
      <span className="absolute top-0 right-0 text-[10px] text-gray-400 px-1 bg-gray-200 rounded-bl-md">Ad</span>
    </div>
  );
};
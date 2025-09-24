import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-200 text-gray-600 p-4 text-center text-xs">
      <p className="font-semibold">Disclaimer:</p>
      <p>This is a third-party, unofficial tool. All winnings must be verified and claimed through official Singapore Pools outlets. The developer is not responsible for any inaccuracies.</p>
       <div className="mt-4 border-t border-gray-300 pt-4">
        <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-800 hover:underline">
          Privacy Policy
        </a>
        <span className="mx-2 text-gray-400">|</span>
        <span className="text-gray-500">&copy; {new Date().getFullYear()} SG Lottery Checker</span>
      </div>
    </footer>
  );
};
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-red-700 text-white p-4 text-center shadow-md sticky top-0 z-20">
      <h1 className="text-xl sm:text-2xl font-bold">SG Lottery Checker</h1>
    </header>
  );
};

import React from 'react';
import type { HistoryEntry, TotoHistoryData, FourDHistoryData } from '../types';
import { DeleteIcon } from './IconComponents';

interface HistoryViewProps {
  history: HistoryEntry[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, setHistory }) => {
  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all ticket history? This cannot be undone.")) {
      setHistory([]);
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <h2 className="text-2xl font-bold mb-2">No History Yet</h2>
        <p className="text-lg">Scan your first ticket to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Checked Tickets</h2>
        <button
          onClick={clearHistory}
          className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-lg text-base font-semibold hover:bg-red-200 transition-colors"
        >
          <DeleteIcon className="mr-2" />
          Clear All
        </button>
      </div>
      <ul className="space-y-4">
        {history.map((entry) => (
          <HistoryItem key={`${entry.checkedAt}-${entry.data.drawDate}`} entry={entry} />
        ))}
      </ul>
    </div>
  );
};

const HistoryItem: React.FC<{ entry: HistoryEntry }> = ({ entry }) => {
  if (entry.gameType === 'toto') {
    return <TotoHistoryItem entry={entry.data} checkedAt={entry.checkedAt} />;
  }
  if (entry.gameType === '4d') {
    return <FourDHistoryItem entry={entry.data} checkedAt={entry.checkedAt} />;
  }
  return null;
};

const TotoHistoryItem: React.FC<{ entry: TotoHistoryData, checkedAt: string }> = ({ entry, checkedAt }) => {
  const winningEntries = entry.prizeInfo.filter(p => p.group > 0);
  const isWinner = winningEntries.length > 0;
  
  let prizeText = "Not a winning ticket";
  if (isWinner) {
      const topPrize = winningEntries.sort((a, b) => a.group - b.group)[0].prize;
      prizeText = winningEntries.length > 1 ? `${topPrize} & others` : topPrize;
  }

  const checkedDate = new Date(checkedAt).toLocaleString('en-SG', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <li className={`border-l-8 ${isWinner ? 'border-green-500' : 'border-red-500'} bg-white shadow-md rounded-lg p-4`}>
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded-full">TOTO</span>
          <p className={`text-xl font-bold mt-1 ${isWinner ? 'text-green-700' : 'text-red-700'}`}>{prizeText}</p>
          <p className="text-sm text-gray-500">Draw Date: {entry.drawDate}</p>
        </div>
        <p className="text-xs text-gray-400 text-right">Checked on <br/> {checkedDate}</p>
      </div>
      <div className="space-y-2 mt-3">
        {entry.entries.map((item, index) => (
           <div key={index} className="flex flex-wrap gap-2">
             {item.numbers.map(num => (
               <span key={num} className="bg-gray-200 text-gray-800 w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm">
                 {num}
               </span>
             ))}
           </div>
        ))}
      </div>
    </li>
  );
};

const FourDHistoryItem: React.FC<{ entry: FourDHistoryData, checkedAt: string }> = ({ entry, checkedAt }) => {
    const isWinner = entry.prizeInfo.length > 0;
    const checkedDate = new Date(checkedAt).toLocaleString('en-SG', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const prizeText = isWinner ? `${entry.prizeInfo.length} Winning ${entry.prizeInfo.length > 1 ? 'Entries' : 'Entry'}` : "Not a winning ticket";

    return (
        <li className={`border-l-8 ${isWinner ? 'border-green-500' : 'border-red-500'} bg-white shadow-md rounded-lg p-4`}>
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded-full">4D</span>
                    <p className={`text-xl font-bold mt-1 ${isWinner ? 'text-green-700' : 'text-red-700'}`}>{prizeText}</p>
                    <p className="text-sm text-gray-500">Draw Date: {entry.drawDate}</p>
                </div>
                <p className="text-xs text-gray-400 text-right">Checked on <br/> {checkedDate}</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                {entry.entries.map((item, index) => (
                   <span key={index} className="bg-gray-200 text-gray-800 font-mono px-2 py-1 rounded-md font-semibold text-sm">
                     {item.number}
                   </span>
                ))}
            </div>
        </li>
    );
};
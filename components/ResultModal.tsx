

import React, { useEffect } from 'react';
import type { ScannedTicket, PrizeInfo, Scanned4DTicket, FourDPrizeInfo } from '../types';
import { CloseIcon, SaveIcon } from './IconComponents';
import { audioService } from '../services/audioService';
import { Confetti } from './Confetti';


interface ResultModalProps {
  gameMode: 'toto' | '4d';
  ticket: ScannedTicket | Scanned4DTicket;
  prizeInfo: PrizeInfo[] | FourDPrizeInfo[];
  onClose: () => void;
  onSave: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = (props) => {
    const { gameMode, onClose, onSave } = props;

    const isWinner = Array.isArray(props.prizeInfo)
        ? (gameMode === 'toto'
            ? (props.prizeInfo as PrizeInfo[]).some(p => p.group > 0)
            : (props.prizeInfo as FourDPrizeInfo[]).length > 0)
        : false;

    useEffect(() => {
        if(isWinner) {
            audioService.playWinSound();
        }
    }, [isWinner]);

    const prizeText = () => {
        if (gameMode === 'toto' && Array.isArray(props.prizeInfo)) {
            const winningEntriesCount = (props.prizeInfo as PrizeInfo[]).filter(p => p.group > 0).length;
            if (winningEntriesCount > 0) {
                 return `You won on ${winningEntriesCount} ${winningEntriesCount > 1 ? 'entries' : 'entry'}!`;
            }
        }
        if(gameMode === '4d' && Array.isArray(props.prizeInfo)) {
            if(props.prizeInfo.length > 0) {
                return `You won on ${props.prizeInfo.length} ${props.prizeInfo.length > 1 ? 'entries' : 'entry'}!`;
            }
        }
        return "Sorry, not a winning ticket.";
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <header className={`relative p-5 rounded-t-2xl text-white text-center ${isWinner ? 'bg-green-600' : 'bg-red-600'}`}>
            {isWinner && <Confetti />}
            <h2 className="text-3xl font-bold">{isWinner ? 'Congratulations!' : 'Try Again!'}</h2>
            <p className="text-xl mt-1">{prizeText()}</p>
            <button onClick={onClose} className="absolute top-3 right-3 text-white hover:bg-white/20 rounded-full p-2 z-10">
                <CloseIcon />
            </button>
            </header>

            <div className="p-6 overflow-y-auto">
                {gameMode === 'toto' && <TotoResult {...props as {ticket: ScannedTicket, prizeInfo: PrizeInfo[]}}/>}
                {gameMode === '4d' && <FourDResult {...props as {ticket: Scanned4DTicket, prizeInfo: FourDPrizeInfo[]}}/>}
            </div>
            
            <footer className="p-5 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
            <button onClick={onSave} className="w-full flex items-center justify-center bg-blue-600 text-white px-6 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
                <SaveIcon className="mr-2" />
                Save to History
            </button>
            <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 px-6 py-4 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors">
                Close
            </button>
            </footer>
        </div>
        </div>
    );
};


const TotoResult: React.FC<{ticket: ScannedTicket, prizeInfo: PrizeInfo[]}> = ({ ticket, prizeInfo }) => {
    
    // Use the first prize entry to get the main winning numbers for display, they are the same for all entries.
    const mainWinningNumbers = prizeInfo[0]?.winningNumbers || [];
    const mainAdditionalNumber = prizeInfo[0]?.additionalNumber || 0;

    const getWinningNumberClass = (num: number, userNumbers: Set<number>) => {
        const isMatched = userNumbers.has(num);
        if(isMatched) return 'bg-green-500 text-white';
        return 'bg-white text-gray-900 border border-gray-300';
    }

    const getAdditionalNumberClass = (num: number, userNumbers: Set<number>) => {
        const isMatched = userNumbers.has(num);
        if(isMatched) return 'bg-blue-500 text-white';
        return 'bg-blue-100 text-blue-800 border border-blue-300';
    }

    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                    Winning Numbers for {ticket.drawDate}
                </h3>
                <div className="grid grid-cols-7 gap-2 items-center">
                    {mainWinningNumbers.map(num => (
                        <div key={num} className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto bg-white text-gray-900 border border-gray-300`}>
                            {num}
                        </div>
                    ))}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto bg-blue-100 text-blue-800 border border-blue-300`}>
                        {mainAdditionalNumber}
                    </div>
                </div>
                <div className="text-center text-sm text-gray-500 mt-2">Last number is the Additional Number</div>
            </section>
            
            <hr className="border-gray-200" />
            
            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Your TOTO Entries</h3>
                <div className="space-y-4">
                    {ticket.entries.map((entry, index) => {
                        const result = prizeInfo[index];
                        const isWinner = result.group > 0;
                        return (
                            <div key={index} className={`p-3 rounded-lg border-l-4 ${isWinner ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                <p className={`font-bold text-lg ${isWinner ? 'text-green-700' : 'text-gray-700'}`}>{result.prize}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {entry.numbers.map(num => {
                                        const isMatched = result.matchedNumbers.includes(num);
                                        const isAdditional = num === result.additionalNumber && result.matchedAdditional;
                                        const numClass = isMatched ? 'bg-green-500 text-white' : isAdditional ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800';
                                        return (
                                            <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${numClass}`}>
                                                {num}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>
        </div>
    );
};

const FourDResult: React.FC<{ticket: Scanned4DTicket, prizeInfo: FourDPrizeInfo[]}> = ({ ticket, prizeInfo }) => {
    // FIX: Explicitly type `winningEntries` to ensure TypeScript correctly infers the type from `Map.get()`.
    // This resolves an issue where `win` was being inferred as `unknown`.
    const winningEntries: Map<string, FourDPrizeInfo> = new Map(prizeInfo.map(p => [p.scannedNumber, p]));

    return (
        <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">Your 4D Entries for {ticket.drawDate}</h3>
            <div className="space-y-3">
              {ticket.entries.map((entry, index) => {
                const win = winningEntries.get(entry.number);
                const isWinner = !!win;
                return (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${isWinner ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                        <div className="flex justify-between items-center">
                           <div>
                             <span className={`font-mono text-2xl font-bold ${isWinner ? 'text-green-800' : 'text-gray-800'}`}>{entry.number}</span>
                             <span className="ml-2 bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">{entry.betType}</span>
                           </div>
                           {win ? (
                                <div className="text-right">
                                    <p className="font-bold text-green-700">{win.winningCategory}</p>
                                    <p className="text-sm text-green-600">{win.prize}</p>
                                </div>
                           ) : (
                                <p className="text-gray-500 font-medium">No Win</p>
                           )}
                        </div>
                    </div>
                )
              })}
            </div>
        </section>
    );
}
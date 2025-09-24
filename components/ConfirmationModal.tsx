import React from 'react';
import type { ScannedTicket, Scanned4DTicket } from '../types';
import { CloseIcon, CheckCircleIcon } from './IconComponents';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    scannedData: ScannedTicket | Scanned4DTicket;
    gameMode: 'toto' | '4d';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, scannedData, gameMode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <header className="relative p-5 border-b border-gray-200 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Confirm Scan</h2>
                    <p className="text-gray-600 mt-1">Did we get this right?</p>
                    <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:bg-gray-100 rounded-full p-2">
                        <CloseIcon />
                    </button>
                </header>

                <div className="p-6 overflow-y-auto">
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-500">Draw Date</p>
                        <p className="text-xl font-bold text-gray-800">{scannedData.drawDate}</p>
                    </div>

                    {gameMode === 'toto' && 'entries' in scannedData && (
                        <div>
                            <p className="text-center text-sm text-gray-500 mb-2">Your TOTO Entries</p>
                            <div className="space-y-3">
                                {(scannedData as ScannedTicket).entries.map((entry, index) => (
                                    <div key={index} className="bg-red-50 p-3 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold bg-red-200 text-red-800 px-2 py-1 rounded-full">{entry.betType || 'Ordinary'}</span>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {entry.numbers.map(num => (
                                                <div key={num} className="bg-red-100 text-red-800 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold">
                                                    {num}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {gameMode === '4d' && 'entries' in scannedData && (
                        <div>
                            <p className="text-center text-sm text-gray-500 mb-2">Your 4D Entries</p>
                            <div className="space-y-2">
                                {(scannedData as Scanned4DTicket).entries.map((entry, index) => (
                                    <div key={index} className="bg-blue-100 text-blue-800 p-2 rounded-lg flex justify-between items-center">
                                        <span className="font-mono text-xl font-bold">{entry.number}</span>
                                        <span className="text-xs font-semibold bg-blue-200 px-2 py-1 rounded-full">{entry.betType}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <footer className="p-5 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                    <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 px-6 py-4 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors">
                        Scan Again
                    </button>
                    <button onClick={onConfirm} className="w-full flex items-center justify-center bg-green-600 text-white px-6 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors">
                        <CheckCircleIcon className="mr-2" />
                        Yes, Check Results
                    </button>
                </footer>
            </div>
        </div>
    );
};

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { parseTicketImage, parse4DTicketImage } from '../services/geminiService';
import { calculateWinnings, getDrawResultByDate } from '../services/totoService';
import { calculate4DWinnings, get4DDrawResultByDate } from '../services/fourDService';
import type { CheckResultPayload } from '../App';
import { CameraIcon } from './IconComponents';
import { Spinner } from './Spinner';
import { ConfirmationModal } from './ConfirmationModal';
import type { ScannedTicket, Scanned4DTicket, PrizeInfo } from '../types';

const getFriendlyErrorMessage = (error: Error): string => {
  if (error.message.includes('AI could not detect')) {
    return error.message;
  }
  if (error.message.includes('AI could not determine a valid draw date')) {
    return "Could not read a valid draw date from the ticket. Please try with a clearer picture.";
  }
   if (error.message.includes('The AI failed to return a valid result')) {
      return "The AI failed to process the image. It might be blurry, angled, or have poor lighting. Please try again."
  }
  // This now catches the new, more user-friendly message from the async service call.
  if (error.message.includes('could not be found')) {
      return error.message;
  }
  if (error.name === 'TypeError' || error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('failed to fetch')) {
      return "A network error occurred. Please check your internet connection and try again."
  }
  return `An unexpected error occurred: ${error.message}`;
};

interface TicketScannerProps {
  gameMode: 'toto' | '4d';
  onCheckResult: (payload: CheckResultPayload) => void;
}

export const TicketScanner: React.FC<TicketScannerProps> = ({ gameMode, onCheckResult }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<ScannedTicket | Scanned4DTicket | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when game mode changes
  useEffect(() => {
    setImagePreview(null);
    setError(null);
    setIsLoading(false);
    setScannedData(null);
    setIsConfirmModalOpen(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, [gameMode]);

  const handleScan = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setScannedData(null);

    try {
      if (gameMode === 'toto') {
        const scannedTicket = await parseTicketImage(file);
        setScannedData(scannedTicket);
      } else { // gameMode === '4d'
        const scannedTicket = await parse4DTicketImage(file);
        setScannedData(scannedTicket);
      }
      setIsConfirmModalOpen(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(getFriendlyErrorMessage(err));
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndCheck = useCallback(async () => {
    if (!scannedData) return;
    setIsLoading(true);
    setError(null);
    setIsConfirmModalOpen(false);
    
    try {
        if (gameMode === 'toto' && 'entries' in scannedData && scannedData.entries[0] && 'numbers' in scannedData.entries[0]) {
            const drawResult = await getDrawResultByDate(scannedData.drawDate);
            if (!drawResult) {
                // More user-friendly error for a "live" app
                throw new Error(`Sorry, the TOTO draw results for ${scannedData.drawDate} could not be found. Please check the date or try again later.`);
            }
            const prizes: PrizeInfo[] = scannedData.entries.map(entry => 
                calculateWinnings(entry.numbers, drawResult)
            );
            onCheckResult({ gameMode: 'toto', ticket: scannedData, prize: prizes });
        } else if (gameMode === '4d' && 'entries' in scannedData && scannedData.entries[0] && 'number' in scannedData.entries[0]) {
            const drawResult = await get4DDrawResultByDate(scannedData.drawDate);
            if (!drawResult) {
                 // More user-friendly error for a "live" app
                throw new Error(`Sorry, the 4D draw results for ${scannedData.drawDate} could not be found. Please check the date or try again later.`);
            }
            const prize = calculate4DWinnings(scannedData as Scanned4DTicket, drawResult);
            onCheckResult({ gameMode: '4d', ticket: scannedData, prize });
        }
    } catch (err) {
        if (err instanceof Error) {
            setError(getFriendlyErrorMessage(err));
        } else {
            setError("An unknown error occurred. Please try again.");
        }
    } finally {
        setIsLoading(false);
        setScannedData(null); // Clear data after checking
    }
  }, [scannedData, onCheckResult, gameMode]);

  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      handleScan(file);
    }
  };

  const handleScanClick = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setScannedData(null);
    // Keep image preview so user knows what they scanned
  };
  
  return (
    <div className="flex flex-col items-center w-full space-y-6">
       <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
      
      <div className="w-full flex flex-col items-center space-y-6">
        <button
          onClick={handleScanClick}
          disabled={isLoading}
          className="w-full h-56 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400 overflow-hidden relative group transition-all duration-200 ease-in-out hover:border-red-500 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:cursor-wait"
          aria-label={imagePreview && !isLoading ? 'Rescan ticket' : 'Scan ticket'}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Ticket Preview" className="h-full w-full object-contain" />
          ) : (
            <div className="text-center text-gray-500 p-4">
              <CameraIcon className="w-16 h-16 mx-auto" />
              <p className="mt-4 text-xl">Tap here to scan your <br/><span className="font-bold">{gameMode.toUpperCase()}</span> ticket</p>
            </div>
          )}

          {isLoading && !isConfirmModalOpen && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white text-xl font-bold transition-opacity duration-300">
                <Spinner className="w-10 h-10 mb-3" />
                <span>Checking...</span>
              </div>
          )}
        </button>
      </div>
      
      {isConfirmModalOpen && scannedData && (
        <ConfirmationModal 
            isOpen={isConfirmModalOpen}
            gameMode={gameMode}
            scannedData={scannedData}
            onClose={handleCloseConfirmModal}
            onConfirm={handleConfirmAndCheck}
        />
      )}

      {error && !isLoading && <p className="mt-6 text-red-600 text-center font-semibold text-lg bg-red-100 p-3 rounded-lg w-full">{error}</p>}
    </div>
  );
};

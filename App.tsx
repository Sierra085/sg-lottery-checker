import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { TicketScanner } from './components/TicketScanner';
import { ResultModal } from './components/ResultModal';
import { HistoryView } from './components/HistoryView';
import { Onboarding } from './components/Onboarding';
import { Footer } from './components/Footer';
import { AdBanner } from './components/AdBanner';
import { CameraIcon, HistoryIcon, ShieldCheckIcon } from './components/IconComponents';
import { GameModeSwitcher } from './components/GameModeSwitcher';
import type { ScannedTicket, PrizeInfo, HistoryEntry, Scanned4DTicket, FourDPrizeInfo, AdBlockerStatus } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SettingsBar } from './components/SettingsBar';
import { AdBlockerModal } from './components/AdBlockerModal';
import { IS_API_KEY_SET } from './services/geminiService';


type View = 'scanner' | 'history';
type GameMode = 'toto' | '4d';

export interface CheckResultPayload {
  gameMode: GameMode;
  ticket: ScannedTicket | Scanned4DTicket;
  prize: PrizeInfo[] | FourDPrizeInfo[];
}

const initialAdBlockerStatus: AdBlockerStatus = { status: 'none' };

function App() {
  const [view, setView] = useState<View>('scanner');
  const [gameMode, setGameMode] = useLocalStorage<GameMode>('gameMode', 'toto');
  const [scannedTicket, setScannedTicket] = useState<ScannedTicket | Scanned4DTicket | null>(null);
  const [prizeInfo, setPrizeInfo] = useState<PrizeInfo[] | FourDPrizeInfo[] | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('lotteryHistory', []);
  const [adBlockerStatus, setAdBlockerStatus] = useLocalStorage<AdBlockerStatus>('adBlockerStatus', initialAdBlockerStatus);
  const [isAdBlockerModalOpen, setIsAdBlockerModalOpen] = useState(false);

  const isAdFree = adBlockerStatus.status === 'lifetime' || (adBlockerStatus.status === 'yearly' && adBlockerStatus.expiry && new Date(adBlockerStatus.expiry) > new Date());

  // Check for expired yearly subscription on app load
  useEffect(() => {
    if (adBlockerStatus.status === 'yearly' && adBlockerStatus.expiry && new Date(adBlockerStatus.expiry) <= new Date()) {
      // Subscription has expired, reset it.
      setAdBlockerStatus(initialAdBlockerStatus);
    }
  }, [adBlockerStatus, setAdBlockerStatus]);


  const handleCheckResult = useCallback((payload: CheckResultPayload) => {
    setGameMode(payload.gameMode);
    setScannedTicket(payload.ticket);
    setPrizeInfo(payload.prize);
    setIsResultModalOpen(true);
  }, [setGameMode]);

  const handleSaveToHistory = useCallback(() => {
    if (scannedTicket && prizeInfo) {
      const baseEntry = {
        checkedAt: new Date().toISOString(),
      };

      let newEntry: HistoryEntry;

      // FIX: Add specific type guards for prizeInfo and cast ticket/prize types to resolve ambiguity
      // when creating the history entry data object.
      if (
        gameMode === 'toto' &&
        'entries' in scannedTicket &&
        scannedTicket.entries?.[0] &&
        'numbers' in scannedTicket.entries[0] &&
        Array.isArray(prizeInfo) &&
        (prizeInfo.length === 0 || 'group' in prizeInfo[0]) // Guard to narrow prizeInfo to PrizeInfo[]
      ) {
         newEntry = {
            ...baseEntry,
            gameType: 'toto',
            data: {
                ...(scannedTicket as ScannedTicket),
                prizeInfo: prizeInfo as PrizeInfo[],
            }
         };
      } else if (
        gameMode === '4d' && 
        'entries' in scannedTicket && 
        scannedTicket.entries?.[0] && 
        'number' in scannedTicket.entries[0] && 
        Array.isArray(prizeInfo) &&
        (prizeInfo.length === 0 || 'winningCategory' in prizeInfo[0]) // Guard to narrow prizeInfo to FourDPrizeInfo[]
      ) {
          newEntry = {
              ...baseEntry,
              gameType: '4d',
              data: {
                  ...(scannedTicket as Scanned4DTicket),
                  prizeInfo: prizeInfo as FourDPrizeInfo[],
              }
          };
      } else {
        // Mismatch, don't save
        console.error("Data mismatch, cannot save to history.");
        setIsResultModalOpen(false);
        return;
      }
      
      setHistory([newEntry, ...history]);
      setIsResultModalOpen(false);
    }
  }, [scannedTicket, prizeInfo, history, setHistory, gameMode]);

  const handleCloseModal = useCallback(() => {
    setIsResultModalOpen(false);
    setScannedTicket(null);
    setPrizeInfo(null);
  }, []);

  const handlePurchase = (newStatus: AdBlockerStatus) => {
    setAdBlockerStatus(newStatus);
    setIsAdBlockerModalOpen(false);
  }

  // CRITICAL: Check for API key and render error if not found.
  // This prevents the blank screen and guides the user to the solution.
  if (!IS_API_KEY_SET) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white shadow-2xl rounded-lg p-8 text-center">
          <ShieldCheckIcon className="w-16 h-16 mx-auto text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Configuration Error</h1>
          <p className="text-gray-600 mt-2">
            The Gemini API Key has not been set up correctly.
          </p>
          <div className="text-left bg-gray-100 p-4 rounded-lg mt-6 text-sm text-gray-700">
            <h2 className="font-bold mb-2">To fix this:</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your project's dashboard on Vercel.</li>
              <li>Navigate to <strong>Settings &gt; Environment Variables</strong>.</li>
              <li>Ensure you have a variable named exactly <code className="bg-gray-200 px-1 rounded">VITE_API_KEY</code>.</li>
              <li>Paste your Gemini API key as its value.</li>
              <li>Go to the <strong>Deployments</strong> tab, find the latest deployment, and click <strong>Redeploy</strong>.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }


  const renderView = () => {
    switch (view) {
      case 'scanner':
        return <TicketScanner onCheckResult={handleCheckResult} gameMode={gameMode} />;
      case 'history':
        return <HistoryView history={history} setHistory={setHistory} />;
      default:
        return <TicketScanner onCheckResult={handleCheckResult} gameMode={gameMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans max-w-md mx-auto shadow-2xl">
      <Header />
      <main className="flex-grow p-4 sm:p-6 bg-white pb-40">
        {!isAdFree && view === 'scanner' && <SettingsBar onRemoveAdsClick={() => setIsAdBlockerModalOpen(true)} />}
        {view === 'scanner' && <Onboarding />}
        {view === 'scanner' && <GameModeSwitcher gameMode={gameMode} setGameMode={setGameMode} />}
        {renderView()}
      </main>
      
      {isResultModalOpen && scannedTicket && prizeInfo && (
        <ResultModal
          gameMode={gameMode}
          ticket={scannedTicket}
          prizeInfo={prizeInfo}
          onClose={handleCloseModal}
          onSave={handleSaveToHistory}
        />
      )}
      
      {isAdBlockerModalOpen && (
          <AdBlockerModal 
            onClose={() => setIsAdBlockerModalOpen(false)}
            onPurchase={handlePurchase}
          />
      )}

      <div className="sticky bottom-0 bg-white border-t border-gray-200 flex flex-col">
        {!isAdFree && <AdBanner />}
        <nav className="grid grid-cols-2 gap-4 p-4">
          <NavButton
            label="Scan Ticket"
            icon={<CameraIcon />}
            isActive={view === 'scanner'}
            onClick={() => setView('scanner')}
          />
          <NavButton
            label="History"
            icon={<HistoryIcon />}
            isActive={view === 'history'}
            onClick={() => setView('history')}
          />
        </nav>
      </div>
      <Footer />
    </div>
  );
}

interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'bg-red-600 text-white';
  const inactiveClasses = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ease-in-out text-base font-semibold ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </button>
  );
};


export default App;

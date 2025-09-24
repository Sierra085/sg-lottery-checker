
export interface ScannedTotoEntry {
    numbers: number[];
    betType: string; // e.g., 'Ordinary', 'System 7'
}

export interface ScannedTicket {
  drawDate: string;
  entries: ScannedTotoEntry[];
}

export interface DrawResult {
  drawDate: string;
  winningNumbers: number[];
  additionalNumber: number;
}

export interface PrizeInfo {
  group: number;
  prize: string;
  matchedNumbers: number[];
  matchedAdditional: boolean;
  winningNumbers: number[];
  additionalNumber: number;
}

// 4D Types
export interface Scanned4DEntry {
    number: string; // Keep as string to preserve leading zeros
    betType: 'Big' | 'Small' | 'iBet' | string; // Allow for other types gemini might find
}

export interface Scanned4DTicket {
    drawDate: string;
    entries: Scanned4DEntry[];
}

export enum FourDPrizeCategory {
    FIRST = "1st Prize",
    SECOND = "2nd Prize",
    THIRD = "3rd Prize",
    STARTER = "Starter Prize",
    CONSOLATION = "Consolation Prize"
}

export interface FourDDrawResult {
    drawDate: string;
    firstPrize: string;
    secondPrize: string;
    thirdPrize: string;
    starterPrizes: string[];
    consolationPrizes: string[];
}

export interface FourDPrizeInfo {
    scannedNumber: string;
    betType: string;
    winningCategory: FourDPrizeCategory;
    prize: string; // e.g., "$2000"
}

// History Types
export type TotoHistoryData = ScannedTicket & {
  prizeInfo: PrizeInfo[];
};

export type FourDHistoryData = Scanned4DTicket & {
  prizeInfo: FourDPrizeInfo[];
};

export type HistoryEntry = {
  checkedAt: string;
} & (
  | { gameType: 'toto'; data: TotoHistoryData }
  | { gameType: '4d'; data: FourDHistoryData }
);

// Ad Blocker Types
export interface AdBlockerStatus {
  status: 'none' | 'yearly' | 'lifetime';
  expiry?: string; // ISO string for the expiry date of yearly subscriptions
}
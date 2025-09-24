import type { FourDDrawResult, FourDPrizeInfo, Scanned4DTicket } from '../types';
import { FOUR_D_RESULTS } from '../data/4dResults';
import { FourDPrizeCategory } from '../types';

export function get4DDrawResultByDate(dateStr: string): FourDDrawResult | null {
  return FOUR_D_RESULTS.find(result => result.drawDate === dateStr) || null;
}

export function getLatest4DDrawResult(): FourDDrawResult {
    return FOUR_D_RESULTS[0];
}

// Simplified prize structure for demonstration
const prizeStructure = {
    'Big': {
        [FourDPrizeCategory.FIRST]: '$2,000',
        [FourDPrizeCategory.SECOND]: '$1,000',
        [FourDPrizeCategory.THIRD]: '$490',
        [FourDPrizeCategory.STARTER]: '$250',
        [FourDPrizeCategory.CONSOLATION]: '$60',
    },
    'Small': {
        [FourDPrizeCategory.FIRST]: '$3,000',
        [FourDPrizeCategory.SECOND]: '$2,000',
        [FourDPrizeCategory.THIRD]: '$800',
    }
} as const;

export function calculate4DWinnings(ticket: Scanned4DTicket, drawResult: FourDDrawResult): FourDPrizeInfo[] {
  const winningResults: FourDPrizeInfo[] = [];

  // Create a map for quick lookup of winning numbers and their prize categories
  const winningNumbersMap = new Map<string, FourDPrizeCategory>();
  winningNumbersMap.set(drawResult.firstPrize, FourDPrizeCategory.FIRST);
  winningNumbersMap.set(drawResult.secondPrize, FourDPrizeCategory.SECOND);
  winningNumbersMap.set(drawResult.thirdPrize, FourDPrizeCategory.THIRD);
  drawResult.starterPrizes.forEach(num => winningNumbersMap.set(num, FourDPrizeCategory.STARTER));
  drawResult.consolationPrizes.forEach(num => winningNumbersMap.set(num, FourDPrizeCategory.CONSOLATION));

  // Iterate over each number the user has on their ticket
  for (const entry of ticket.entries) {
    const winningCategory = winningNumbersMap.get(entry.number);

    // If the number is not a winning number at all, skip to the next one
    if (!winningCategory) {
      continue;
    }

    // Explicitly handle only 'Big' and 'Small' bet types.
    // This prevents other types (like 'iBet') from being processed incorrectly.
    if (entry.betType === 'Big' || entry.betType === 'Small') {
        const prizesForBet = prizeStructure[entry.betType];
        
        // Check if the winning category is valid for the given bet type
        // e.g., 'Small' bets don't win on Starter prizes, so this check will fail.
        const prizeAmount = prizesForBet[winningCategory as keyof typeof prizesForBet];

        if (prizeAmount) {
            winningResults.push({
                scannedNumber: entry.number,
                betType: entry.betType,
                winningCategory: winningCategory,
                prize: prizeAmount,
            });
        }
    }
  }

  // Note: iBet calculation is complex (involves permutations) and is not implemented for this demonstration.
  return winningResults;
}

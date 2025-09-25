
import type { FourDDrawResult, FourDPrizeInfo, Scanned4DTicket } from '../types';
import { FOUR_D_RESULTS } from '../data/4dResults';
import { FourDPrizeCategory } from '../types';

// In-memory cache to simulate fetching data only once per session
let cached4DResults: FourDDrawResult[] | null = null;

/**
 * Simulates fetching all 4D results from an API.
 * In a real app, this would be a `fetch` call to a backend endpoint.
 * The result is cached in memory to avoid repeated "network" calls during the same session.
 */
async function fetchAll4DResults(): Promise<FourDDrawResult[]> {
    // If results are already cached, return them immediately.
    if (cached4DResults) {
        return cached4DResults;
    }

    // Simulate network delay for the first fetch to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real app, you would replace this block with a fetch call:
    // try {
    //   const response = await fetch('https://your-api-endpoint.com/4d-results');
    //   if (!response.ok) throw new Error('Network response was not ok');
    //   const data = await response.json();
    //   cached4DResults = data;
    // } catch (error) {
    //   console.error("Failed to fetch 4D results:", error);
    //   return []; // Return empty array on failure to prevent app crash
    // }
    
    // For demonstration, we use static data and cache it.
    cached4DResults = FOUR_D_RESULTS;
    return cached4DResults;
}

/**
 * Gets the 4D draw result for a specific date.
 * @param dateStr The date in 'YYYY-MM-DD' format.
 * @returns A promise that resolves to the FourDDrawResult or null if not found.
 */
export async function get4DDrawResultByDate(dateStr: string): Promise<FourDDrawResult | null> {
  const allResults = await fetchAll4DResults();
  return allResults.find(result => result.drawDate === dateStr) || null;
}

/**
 * Gets the latest available 4D draw result.
 * @returns A promise that resolves to the latest FourDDrawResult.
 */
export async function getLatest4DDrawResult(): Promise<FourDDrawResult> {
    const allResults = await fetchAll4DResults();
    if (allResults.length === 0) {
        throw new Error("No 4D results are available.");
    }
    return allResults[0];
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

/**
 * Calculates all winning prizes for a 4D ticket based on the draw result.
 * This is a synchronous function as it's pure logic.
 * @param ticket The scanned 4D ticket.
 * @param drawResult The official draw result for the corresponding date.
 * @returns An array of FourDPrizeInfo objects for each winning entry.
 */
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

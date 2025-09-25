
import type { DrawResult, PrizeInfo } from '../types';
import { TOTO_RESULTS } from '../data/drawResults';

// In-memory cache to simulate fetching data only once per session
let cachedTotoResults: DrawResult[] | null = null;

/**
 * Simulates fetching all TOTO results from an API.
 * In a real app, this would be a `fetch` call to a backend endpoint.
 * The result is cached in memory to avoid repeated "network" calls during the same session.
 */
async function fetchAllTotoResults(): Promise<DrawResult[]> {
  // If results are already cached, return them immediately.
  if (cachedTotoResults) {
    return cachedTotoResults;
  }

  // Simulate network delay for the first fetch to mimic a real API call
  await new Promise(resolve => setTimeout(resolve, 800));

  // In a real app, you would replace this block with a fetch call:
  // try {
  //   const response = await fetch('https://your-api-endpoint.com/toto-results');
  //   if (!response.ok) throw new Error('Network response was not ok');
  //   const data = await response.json();
  //   cachedTotoResults = data;
  // } catch (error) {
  //   console.error("Failed to fetch TOTO results:", error);
  //   return []; // Return empty array on failure to prevent app crash
  // }
  
  // For demonstration, we use static data and cache it.
  cachedTotoResults = TOTO_RESULTS;
  return cachedTotoResults;
}


/**
 * Gets the TOTO draw result for a specific date.
 * @param dateStr The date in 'YYYY-MM-DD' format.
 * @returns A promise that resolves to the DrawResult or null if not found.
 */
export async function getDrawResultByDate(dateStr: string): Promise<DrawResult | null> {
  const allResults = await fetchAllTotoResults();
  return allResults.find(result => result.drawDate === dateStr) || null;
}

/**
 * Gets the latest available TOTO draw result.
 * @returns A promise that resolves to the latest DrawResult.
 */
export async function getLatestDrawResult(): Promise<DrawResult> {
    const allResults = await fetchAllTotoResults();
    // Assuming TOTO_RESULTS is sorted with the latest first
    if (allResults.length === 0) {
        throw new Error("No TOTO results are available.");
    }
    return allResults[0];
}

/**
 * Calculates the prize for a single TOTO entry based on the draw result.
 * This is a synchronous function as it's pure logic.
 * @param numbers The numbers on the ticket entry.
 * @param drawResult The official draw result for the corresponding date.
 * @returns A PrizeInfo object detailing the win or loss.
 */
export function calculateWinnings(numbers: number[], drawResult: DrawResult): PrizeInfo {
  const userNumbers = new Set(numbers);
  const winningNumbers = new Set(drawResult.winningNumbers);
  
  const matchedNumbers: number[] = [];
  userNumbers.forEach(num => {
    if (winningNumbers.has(num)) {
      matchedNumbers.push(num);
    }
  });

  const matchCount = matchedNumbers.length;
  const matchedAdditional = userNumbers.has(drawResult.additionalNumber);

  let group = 0;
  let prize = "Sorry, not a winning ticket.";

  if (matchCount === 6) {
    group = 1;
    prize = "Group 1 Jackpot!";
  } else if (matchCount === 5 && matchedAdditional) {
    group = 2;
    prize = "Group 2 Winner!";
  } else if (matchCount === 5) {
    group = 3;
    prize = "Group 3 Winner";
  } else if (matchCount === 4 && matchedAdditional) {
    group = 4;
    prize = "Group 4 Winner";
  } else if (matchCount === 4) {
    group = 5;
    prize = "$50";
  } else if (matchCount === 3 && matchedAdditional) {
    group = 6;
    prize = "$25";
  } else if (matchCount === 3) {
    group = 7;
    prize = "$10";
  }

  return {
    group,
    prize,
    matchedNumbers,
    matchedAdditional,
    winningNumbers: drawResult.winningNumbers,
    additionalNumber: drawResult.additionalNumber
  };
}

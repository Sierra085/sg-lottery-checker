
import type { DrawResult, PrizeInfo } from '../types';
import { TOTO_RESULTS } from '../data/drawResults';

export function getDrawResultByDate(dateStr: string): DrawResult | null {
  // Simple search, for a real app this would be an API call
  return TOTO_RESULTS.find(result => result.drawDate === dateStr) || null;
}

export function getLatestDrawResult(): DrawResult {
    // Assuming TOTO_RESULTS is sorted with the latest first
    return TOTO_RESULTS[0];
}

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
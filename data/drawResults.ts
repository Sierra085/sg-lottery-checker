
import type { DrawResult } from '../types';

// Data for demonstration. In a real app, this would come from an API.
// Assumed to be sorted with the latest draw first.
export const TOTO_RESULTS: DrawResult[] = [
  {
    drawDate: '2024-07-25',
    winningNumbers: [4, 12, 18, 25, 33, 49],
    additionalNumber: 7
  },
  {
    drawDate: '2024-07-22',
    winningNumbers: [5, 11, 21, 28, 36, 40],
    additionalNumber: 15
  },
  {
    drawDate: '2024-07-18',
    winningNumbers: [2, 19, 23, 30, 41, 44],
    additionalNumber: 38
  },
  {
    drawDate: '2024-07-15',
    winningNumbers: [9, 14, 20, 22, 31, 47],
    additionalNumber: 1
  },
  // Added historical data for testing
  {
    drawDate: '2023-11-16',
    winningNumbers: [6, 10, 15, 22, 35, 48],
    additionalNumber: 49,
  },
  {
    drawDate: '2023-05-08',
    winningNumbers: [3, 11, 16, 24, 29, 46],
    additionalNumber: 8,
  },
  {
    drawDate: '2023-02-23',
    winningNumbers: [1, 9, 10, 11, 23, 49],
    additionalNumber: 34,
  },
  {
    drawDate: '2022-09-29',
    winningNumbers: [1, 17, 18, 20, 31, 45],
    additionalNumber: 4,
  },
  {
    drawDate: '2022-02-10',
    winningNumbers: [13, 14, 25, 26, 30, 41],
    additionalNumber: 47,
  }
];
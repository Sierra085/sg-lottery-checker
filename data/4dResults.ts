import type { FourDDrawResult } from '../types';

// Data for demonstration. In a real app, this would come from an API.
// Assumed to be sorted with the latest draw first.
export const FOUR_D_RESULTS: FourDDrawResult[] = [
  {
    drawDate: '2025-02-23',
    firstPrize: '6666',
    secondPrize: '3874',
    thirdPrize: '4593',
    starterPrizes: ['0235', '1081', '1414', '2238', '2415', '2607', '3038', '6260', '7755', '9773'],
    consolationPrizes: ['0000', '0025', '1399', '3220', '3855', '3890', '4042', '5887', '6465', '8456']
  },
  {
    drawDate: '2024-07-24',
    firstPrize: '1122',
    secondPrize: '3344',
    thirdPrize: '5566',
    starterPrizes: ['7788', '9900', '1234', '5678', '9012', '3456', '7890', '2345', '6789', '0123'],
    consolationPrizes: ['4567', '8901', '2346', '6790', '1245', '5689', '0134', '3467', '7801', '9023']
  },
  {
    drawDate: '2024-07-21',
    firstPrize: '9876',
    secondPrize: '5432',
    thirdPrize: '1098',
    starterPrizes: ['2109', '8765', '4321', '0987', '6543', '2108', '8764', '4320', '0986', '6542'],
    consolationPrizes: ['1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '0000']
  },
  {
    drawDate: '2024-07-20',
    firstPrize: '2468',
    secondPrize: '1357',
    thirdPrize: '8642',
    starterPrizes: ['9753', '1235', '3579', '5791', '7913', '9135', '1358', '3570', '5792', '7914'],
    consolationPrizes: ['0246', '1358', '2469', '3571', '4682', '5793', '6804', '7915', '8026', '9137']
  },
  // Added historical data for testing
  {
    drawDate: '2023-10-18',
    firstPrize: '8888',
    secondPrize: '1234',
    thirdPrize: '5678',
    starterPrizes: ['1111', '2222', '3333', '4444', '5555', '6666', '7777', '9999', '0000', '1000'],
    consolationPrizes: ['2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '0001', '0002']
  },
  {
    drawDate: '2023-02-25',
    firstPrize: '8992',
    secondPrize: '2334',
    thirdPrize: '1542',
    starterPrizes: ['1084', '1661', '2455', '4147', '5047', '5200', '7404', '8295', '8701', '9922'],
    consolationPrizes: ['0230', '0354', '0868', '0935', '1338', '2566', '4010', '4715', '7733', '9022']
  },
  {
    drawDate: '2022-06-01',
    firstPrize: '4321',
    secondPrize: '8765',
    thirdPrize: '9012',
    starterPrizes: ['3456', '7890', '1122', '3344', '5566', '7788', '9900', '1212', '3434', '5656'],
    consolationPrizes: ['7878', '9090', '1221', '3443', '5665', '7887', '9009', '2112', '4334', '6556']
  }
];
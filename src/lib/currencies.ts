import Decimal from 'decimal.js';
import { Currency, CurrencyCode } from '../types';

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, Currency> = {
  BDT: { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rateAgainstUSD: 122.0 },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rateAgainstUSD: 1.0 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rateAgainstUSD: 0.95 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rateAgainstUSD: 0.79 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rateAgainstUSD: 86.8 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rateAgainstUSD: 3.67 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', rateAgainstUSD: 3.75 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateAgainstUSD: 154.2 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rateAgainstUSD: 1.42 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rateAgainstUSD: 1.57 },
};

/**
 * Convert any amount from one currency to another using Decimal.js for exact precision
 */
export function convertCurrency(
  amount: number | string,
  from: CurrencyCode,
  to: CurrencyCode,
  customRates?: Record<CurrencyCode, number>
): number {
  if (from === to) {
    return new Decimal(amount || 0).toNumber();
  }

  const decAmount = new Decimal(amount || 0);
  const fromRate = customRates?.[from] ?? SUPPORTED_CURRENCIES[from]?.rateAgainstUSD ?? 1;
  const toRate = customRates?.[to] ?? SUPPORTED_CURRENCIES[to]?.rateAgainstUSD ?? 1;

  // Convert to USD base first: USD = Amount / fromRate
  // Then convert USD to target: Target = USD * toRate
  const usdAmount = decAmount.dividedBy(new Decimal(fromRate));
  const converted = usdAmount.times(new Decimal(toRate));

  return converted.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Format monetary amount with symbol and locale grouping
 */
export function formatCurrency(
  amount: number | string,
  currencyCode: CurrencyCode = 'BDT',
  includeSymbol: boolean = true
): string {
  const dec = new Decimal(amount || 0);
  const formattedNumber = dec.toNumber().toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (!includeSymbol) return formattedNumber;

  const symbol = SUPPORTED_CURRENCIES[currencyCode]?.symbol || currencyCode;
  
  // For Taka, INR, etc., symbol before amount
  return `${symbol} ${formattedNumber}`;
}

/**
 * Format compact money (e.g. 1.2M, 45K)
 */
export function formatCompactCurrency(
  amount: number | string,
  currencyCode: CurrencyCode = 'BDT'
): string {
  const num = new Decimal(amount || 0).toNumber();
  const symbol = SUPPORTED_CURRENCIES[currencyCode]?.symbol || currencyCode;

  if (Math.abs(num) >= 1_000_000_000) {
    return `${symbol} ${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(num) >= 1_000_000) {
    return `${symbol} ${(num / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(num) >= 1_000) {
    return `${symbol} ${(num / 1_000).toFixed(1)}K`;
  }
  return `${symbol} ${num.toFixed(0)}`;
}

import { WebshopSettings } from '@/api/webshop-api';

export type CurrencyCode = 'UZS' | 'USD' | 'EUR' | 'KZT' | 'RUB' | 'GBP' | 'CNY' | 'JPY' | 'AED' | 'TRY';

// Currency configuration with locale and formatting options
export const CURRENCY_CONFIG: Record<CurrencyCode, {
  locale: string;
  symbol: string;
  name: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
}> = {
  UZS: {
    locale: 'uz-UZ',
    symbol: 'сум',
    name: 'Uzbekistani Som',
    decimals: 0,
    symbolPosition: 'after'
  },
  USD: {
    locale: 'en-US',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
    symbolPosition: 'before'
  },
  EUR: {
    locale: 'de-DE',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
    symbolPosition: 'after'
  },
  KZT: {
    locale: 'kk-KZ',
    symbol: '₸',
    name: 'Kazakhstani Tenge',
    decimals: 0,
    symbolPosition: 'after'
  },
  RUB: {
    locale: 'ru-RU',
    symbol: '₽',
    name: 'Russian Ruble',
    decimals: 2,
    symbolPosition: 'after'
  },
  GBP: {
    locale: 'en-GB',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
    symbolPosition: 'before'
  },
  CNY: {
    locale: 'zh-CN',
    symbol: '¥',
    name: 'Chinese Yuan',
    decimals: 2,
    symbolPosition: 'before'
  },
  JPY: {
    locale: 'ja-JP',
    symbol: '¥',
    name: 'Japanese Yen',
    decimals: 0,
    symbolPosition: 'before'
  },
  AED: {
    locale: 'ar-AE',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    decimals: 2,
    symbolPosition: 'after'
  },
  TRY: {
    locale: 'tr-TR',
    symbol: '₺',
    name: 'Turkish Lira',
    decimals: 2,
    symbolPosition: 'after'
  }
};

/**
 * Format price with currency using custom formatting for better regional support
 */
export function formatPrice(
  amount: number,
  currency: CurrencyCode = 'USD',
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
    locale?: string;
  }
): string {
  const config = CURRENCY_CONFIG[currency];
  const locale = options?.locale || config.locale;
  
  // Determine decimal places
  let minimumFractionDigits = config.decimals;
  let maximumFractionDigits = config.decimals;
  
  if (options?.showDecimals === false) {
    minimumFractionDigits = 0;
    maximumFractionDigits = 0;
  }
  
  try {
    // For better control over formatting, especially for UZS and other currencies,
    // we'll format the number first, then add the currency symbol
    const numberFormatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      notation: options?.compact ? 'compact' : 'standard',
    });
    
    const formattedNumber = numberFormatter.format(amount);
    
    // Apply currency symbol based on position preference
    if (config.symbolPosition === 'before') {
      return `${config.symbol}${formattedNumber}`;
    } else {
      // For currencies like UZS, RUB, etc. that go after the number
      return `${formattedNumber} ${config.symbol}`;
    }
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    console.warn(`Failed to format currency ${currency}:`, error);
    return formatPriceFallback(amount, currency, options);
  }
}

/**
 * Fallback price formatting without Intl.NumberFormat
 */
function formatPriceFallback(
  amount: number,
  currency: CurrencyCode,
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
  }
): string {
  const config = CURRENCY_CONFIG[currency];
  
  // Format number with appropriate decimals
  let decimals = config.decimals;
  if (options?.showDecimals === false) {
    decimals = 0;
  }
  
  let formattedNumber = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  // Apply compact notation manually if needed
  if (options?.compact && amount >= 1000) {
    if (amount >= 1000000) {
      formattedNumber = (amount / 1000000).toFixed(decimals > 0 ? 1 : 0) + 'M';
    } else if (amount >= 1000) {
      formattedNumber = (amount / 1000).toFixed(decimals > 0 ? 1 : 0) + 'K';
    }
  }
  
  // Position symbol according to currency convention
  if (config.symbolPosition === 'before') {
    return `${config.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${config.symbol}`;
  }
}

/**
 * Format price range (min - max)
 */
export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  currency: CurrencyCode = 'USD',
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
    locale?: string;
  }
): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency, options);
  }
  
  const formattedMin = formatPrice(minPrice, currency, options);
  const formattedMax = formatPrice(maxPrice, currency, options);
  
  return `${formattedMin} - ${formattedMax}`;
}

/**
 * Format discount percentage
 */
export function formatDiscountPercentage(originalPrice: number, discountPrice: number): string {
  if (originalPrice <= 0 || discountPrice >= originalPrice) {
    return '';
  }
  
  const discountPercent = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  return `-${discountPercent}%`;
}

/**
 * Get currency symbol only
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_CONFIG[currency]?.symbol || currency;
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: CurrencyCode): string {
  return CURRENCY_CONFIG[currency]?.name || currency;
}

/**
 * Check if currency uses decimals
 */
export function currencyUsesDecimals(currency: CurrencyCode): boolean {
  return CURRENCY_CONFIG[currency]?.decimals > 0;
}

/**
 * Create a currency formatter function for a specific currency
 */
export function createCurrencyFormatter(currency: CurrencyCode, options?: {
  showDecimals?: boolean;
  compact?: boolean;
  locale?: string;
}) {
  return (amount: number) => formatPrice(amount, currency, options);
}

/**
 * Parse price string back to number (removes currency symbols and formatting)
 */
export function parsePrice(priceString: string, currency: CurrencyCode): number | null {
  if (!priceString) return null;
  
  const config = CURRENCY_CONFIG[currency];
  
  // Remove currency symbol and common formatting
  let cleanString = priceString
    .replace(config.symbol, '')
    .replace(/[,\s]/g, '')
    .trim();
  
  // Handle different decimal separators
  if (config.locale.includes('de') || config.locale.includes('ru')) {
    // European format: 1.234,56
    cleanString = cleanString.replace('.', '').replace(',', '.');
  }
  
  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Validate if a currency code is supported
 */
export function isSupportedCurrency(currency: string): currency is CurrencyCode {
  return currency in CURRENCY_CONFIG;
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): CurrencyCode[] {
  return Object.keys(CURRENCY_CONFIG) as CurrencyCode[];
}

/**
 * Format price with settings from webshop settings
 */
export function formatPriceWithSettings(
  amount: number,
  settings: WebshopSettings | null,
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
    locale?: string;
  }
): string {
  const currency = settings?.currency || 'USD';
  return formatPrice(amount, currency, options);
}

/**
 * Create formatter from webshop settings
 */
export function createFormatterFromSettings(
  settings: WebshopSettings | null,
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
    locale?: string;
  }
) {
  const currency = settings?.currency || 'USD';
  return createCurrencyFormatter(currency, options);
}

/**
 * Format price with automatic decimal handling based on amount
 * Small amounts show decimals, large amounts may not
 */
export function formatPriceAuto(
  amount: number,
  currency: CurrencyCode = 'USD',
  options?: {
    compact?: boolean;
    locale?: string;
  }
): string {
  const config = CURRENCY_CONFIG[currency];
  
  // For currencies without decimals (like UZS, JPY), never show decimals
  if (config.decimals === 0) {
    return formatPrice(amount, currency, { ...options, showDecimals: false });
  }
  
  // For amounts over 1000, consider not showing decimals if they're .00
  if (amount >= 1000 && amount % 1 === 0) {
    return formatPrice(amount, currency, { ...options, showDecimals: false });
  }
  
  // Otherwise show decimals
  return formatPrice(amount, currency, options);
}

/**
 * Format price with smart compact notation
 * Uses K, M notation for large amounts while preserving currency formatting
 */
export function formatPriceCompact(
  amount: number,
  currency: CurrencyCode = 'USD',
  options?: {
    locale?: string;
  }
): string {
  return formatPrice(amount, currency, { ...options, compact: true });
}

/**
 * Get example formatted prices for a currency (useful for UI previews)
 */
export function getExamplePrices(currency: CurrencyCode): {
  small: string;
  medium: string;
  large: string;
} {
  return {
    small: formatPrice(99, currency),
    medium: formatPrice(1500, currency),
    large: formatPrice(25000, currency)
  };
}

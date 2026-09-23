/**
 * ReWork Currency & Exchange Rate Utility
 * Handles conversions and formatting between USDC, XLM, and Argentine Pesos (ARS).
 */

export interface CurrencyRates {
  USDC_TO_ARS: number;
  XLM_TO_USDC: number;
  XLM_TO_ARS: number;
}

// Current realistic market reference rates (Crypto USD / Dólar Cripto in Argentina)
export const DEFAULT_RATES: CurrencyRates = {
  USDC_TO_ARS: 1280, // 1 USDC = 1,280 ARS
  XLM_TO_USDC: 0.28, // 1 XLM = 0.28 USDC
  XLM_TO_ARS: 0.28 * 1280, // 1 XLM ≈ 358.40 ARS
};

export type SupportedCurrency = 'USDC' | 'ARS' | 'XLM';

/**
 * Formats a numeric value into a localized currency string
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'USDC',
  includeSymbol: boolean = true
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }

  switch (currency) {
    case 'ARS':
      return includeSymbol
        ? `$ ${amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ARS`
        : amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    case 'USDC':
      return includeSymbol
        ? `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`
        : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'XLM':
      return includeSymbol
        ? `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XLM`
        : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    default:
      return `${amount} ${currency}`;
  }
}

/**
 * Converts any amount between supported currencies
 */
export function convertCurrency(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
  rates: CurrencyRates = DEFAULT_RATES
): number {
  if (from === to) return amount;

  // Convert `from` to base USDC
  let usdc = 0;
  if (from === 'USDC') usdc = amount;
  else if (from === 'ARS') usdc = amount / rates.USDC_TO_ARS;
  else if (from === 'XLM') usdc = amount * rates.XLM_TO_USDC;

  // Convert base USDC to `to`
  if (to === 'USDC') return usdc;
  if (to === 'ARS') return usdc * rates.USDC_TO_ARS;
  if (to === 'XLM') return rates.XLM_TO_USDC > 0 ? usdc / rates.XLM_TO_USDC : 0;

  return amount;
}

/**
 * Generates the triple price object (ARS, USDC, XLM) from a base USDC or given amount
 */
export function getTripleValues(
  amount: number,
  sourceCurrency: SupportedCurrency = 'USDC',
  rates: CurrencyRates = DEFAULT_RATES
) {
  const usdc = convertCurrency(amount, sourceCurrency, 'USDC', rates);
  const ars = convertCurrency(amount, sourceCurrency, 'ARS', rates);
  const xlm = convertCurrency(amount, sourceCurrency, 'XLM', rates);

  return {
    usdc,
    ars,
    xlm,
    formatted: {
      usdc: formatCurrency(usdc, 'USDC'),
      ars: formatCurrency(ars, 'ARS'),
      xlm: formatCurrency(xlm, 'XLM'),
    },
  };
}

/**
 * ReWork Currency & Exchange Rate Utility
 * Handles conversions and formatting between USDC, XLM, SOL, CELO, USA₮, USD₮, Ripio wFIAT (wARS, wBRL, wMXN, wCOP, wPEN, wCLP), and Argentine Pesos (ARS).
 */

import { CELO_ASSETS, type CeloAssetSymbol } from './celo-assets';

export interface CurrencyRates {
  USDC_TO_ARS: number;
  XLM_TO_USDC: number;
  XLM_TO_ARS: number;
  SOL_TO_USDC: number;
  SOL_TO_ARS: number;
  CELO_TO_USDC: number;
  CELO_TO_ARS: number;
}

// Current realistic market reference rates (Crypto USD / Dólar Cripto in Argentina)
export const DEFAULT_RATES: CurrencyRates = {
  USDC_TO_ARS: 1200, // 1 USDC = 1,200 ARS (Ripio wARS parity)
  XLM_TO_USDC: 0.28, // 1 XLM = 0.28 USDC
  XLM_TO_ARS: 0.28 * 1200, // 1 XLM ≈ 336 ARS
  SOL_TO_USDC: 152.5, // 1 SOL ≈ 152.50 USDC
  SOL_TO_ARS: 152.5 * 1200, // 1 SOL ≈ 183,000 ARS
  CELO_TO_USDC: 0.68, // 1 CELO ≈ 0.68 USDC
  CELO_TO_ARS: 0.68 * 1200, // 1 CELO ≈ 816 ARS
};

export type SupportedCurrency =
  | 'USDC'
  | 'ARS'
  | 'BRL'
  | 'COP'
  | 'MXN'
  | 'PEN'
  | 'CLP'
  | 'XLM'
  | 'SOL'
  | 'CELO'
  | CeloAssetSymbol;

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
    case 'wARS':
      return includeSymbol
        ? `$ ${amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ARS`
        : amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    case 'BRL':
    case 'wBRL':
      return includeSymbol
        ? `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BRL`
        : amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'COP':
    case 'wCOP':
      return includeSymbol
        ? `$ ${amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} COP`
        : amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    case 'MXN':
    case 'wMXN':
      return includeSymbol
        ? `$ ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`
        : amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'PEN':
    case 'wPEN':
      return includeSymbol
        ? `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PEN`
        : amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'CLP':
    case 'wCLP':
      return includeSymbol
        ? `$ ${amount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} CLP`
        : amount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    case 'USDC':
    case 'USAT':
    case 'USDT':
      return includeSymbol
        ? `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency === 'USAT' ? 'USA₮' : currency === 'USDT' ? 'USD₮' : currency}`
        : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'XLM':
    case 'CELO':
      return includeSymbol
        ? `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
        : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'SOL':
      return includeSymbol
        ? `${amount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 4 })} SOL`
        : amount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 4 });
    default:
      return `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}`;
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
  if (from === 'USDC' || from === 'USAT' || from === 'USDT') usdc = amount;
  else if (from === 'ARS' || from === 'wARS') usdc = amount / rates.USDC_TO_ARS;
  else if (from === 'BRL' || from === 'wBRL') usdc = amount / 5.75;
  else if (from === 'COP' || from === 'wCOP') usdc = amount / 4250;
  else if (from === 'MXN' || from === 'wMXN') usdc = amount / 20.1;
  else if (from === 'PEN' || from === 'wPEN') usdc = amount / 3.75;
  else if (from === 'CLP' || from === 'wCLP') usdc = amount / 960;
  else if (from === 'XLM') usdc = amount * rates.XLM_TO_USDC;
  else if (from === 'SOL') usdc = amount * rates.SOL_TO_USDC;
  else if (from === 'CELO') usdc = amount * rates.CELO_TO_USDC;
  else if (from in CELO_ASSETS) {
    usdc = amount * CELO_ASSETS[from as CeloAssetSymbol].referenceUsdRate;
  }

  // Convert base USDC to `to`
  if (to === 'USDC' || to === 'USAT' || to === 'USDT') return usdc;
  if (to === 'ARS' || to === 'wARS') return usdc * rates.USDC_TO_ARS;
  if (to === 'BRL' || to === 'wBRL') return usdc * 5.75;
  if (to === 'COP' || to === 'wCOP') return usdc * 4250;
  if (to === 'MXN' || to === 'wMXN') return usdc * 20.1;
  if (to === 'PEN' || to === 'wPEN') return usdc * 3.75;
  if (to === 'CLP' || to === 'wCLP') return usdc * 960;
  if (to === 'XLM') return rates.XLM_TO_USDC > 0 ? usdc / rates.XLM_TO_USDC : 0;
  if (to === 'SOL') return rates.SOL_TO_USDC > 0 ? usdc / rates.SOL_TO_USDC : 0;
  if (to === 'CELO') return rates.CELO_TO_USDC > 0 ? usdc / rates.CELO_TO_USDC : 0;
  if (to in CELO_ASSETS) {
    const rate = CELO_ASSETS[to as CeloAssetSymbol].referenceUsdRate;
    return rate > 0 ? usdc / rate : 0;
  }

  return amount;
}

/**
 * Generates the multi-currency price object (ARS, USDC, XLM, SOL, CELO, wARS, USA₮) from a base USDC or given amount
 */
export function getTripleValues(
  amount: number,
  sourceCurrency: SupportedCurrency = 'USDC',
  rates: CurrencyRates = DEFAULT_RATES
) {
  const usdc = convertCurrency(amount, sourceCurrency, 'USDC', rates);
  const ars = convertCurrency(amount, sourceCurrency, 'ARS', rates);
  const xlm = convertCurrency(amount, sourceCurrency, 'XLM', rates);
  const sol = convertCurrency(amount, sourceCurrency, 'SOL', rates);
  const celo = convertCurrency(amount, sourceCurrency, 'CELO', rates);
  const wars = convertCurrency(amount, sourceCurrency, 'wARS', rates);
  const usat = usdc;

  return {
    usdc,
    ars,
    xlm,
    sol,
    celo,
    wars,
    usat,
    formatted: {
      usdc: formatCurrency(usdc, 'USDC'),
      ars: formatCurrency(ars, 'ARS'),
      xlm: formatCurrency(xlm, 'XLM'),
      sol: formatCurrency(sol, 'SOL'),
      celo: formatCurrency(celo, 'CELO'),
      wars: formatCurrency(wars, 'wARS'),
      usat: formatCurrency(usat, 'USAT'),
    },
  };
}

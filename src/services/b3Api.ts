/**
 * Servico de integracao com dados da B3 (Bolsa de Valores)
 *
 * NOTA: A B3 nao possui uma API publica oficial gratuita.
 * Este modulo esta estruturado para facilmente migrar para uma API real
 * quando disponivel (ex: Alpha Vantage, Yahoo Finance, etc.)
 *
 * Atualmente usa dados mockados para demonstracao.
 */

import type { MarketData, InvestmentOpportunity, InvestmentType } from '../types';

// ============ CONFIGURACAO ============
// A Brapi permite uso basico sem key, mas voce pode adicionar uma se tiver.
const API_KEY = ''; // Opcional para Brapi basico
const BASE_URL = 'https://brapi.dev/api/quote';

// ============ DADOS MOCKADOS ============
// Simulacao de dados da B3 para demonstracao
const MOCK_MARKET_DATA: MarketData[] = [
  // Acoes
  { ticker: 'PETR4', price: 35.82, change: 0.45, changePercent: 1.27, volume: 12500000, dividendYield: 7.2, pvp: 0.98, sector: 'Petróleo' },
  { ticker: 'VALE3', price: 68.15, change: -1.23, changePercent: -1.77, volume: 8900000, dividendYield: 8.5, pvp: 1.15, sector: 'Mineração' },
  { ticker: 'ITUB4', price: 32.45, change: 0.21, changePercent: 0.65, volume: 5600000, dividendYield: 3.8, pvp: 1.42, sector: 'Financeiro' },
  { ticker: 'BBDC4', price: 15.78, change: -0.15, changePercent: -0.94, volume: 4300000, dividendYield: 6.2, pvp: 0.89, sector: 'Financeiro' },
  { ticker: 'ABEV3', price: 12.34, change: 0.08, changePercent: 0.65, volume: 3200000, dividendYield: 4.1, pvp: 2.15, sector: 'Bebidas' },
  { ticker: 'WEGE3', price: 42.50, change: 0.85, changePercent: 2.04, volume: 2100000, dividendYield: 1.2, pvp: 3.45, sector: 'Bens Industriais' },
  { ticker: 'RENT3', price: 55.30, change: 1.10, changePercent: 2.03, volume: 1800000, dividendYield: 1.8, pvp: 2.78, sector: 'Locação' },
  { ticker: 'BBAS3', price: 52.10, change: -0.40, changePercent: -0.76, volume: 1500000, dividendYield: 8.9, pvp: 0.95, sector: 'Financeiro' },
  { ticker: 'SUZB3', price: 52.45, change: 0.95, changePercent: 1.85, volume: 1200000, dividendYield: 1.5, pvp: 1.65, sector: 'Papel e Celulose' },
  { ticker: 'LREN3', price: 18.90, change: -0.30, changePercent: -1.56, volume: 2800000, dividendYield: 1.1, pvp: 2.45, sector: 'Varejo' },

  // FIIs
  { ticker: 'KNCR11', price: 105.20, change: 0.15, changePercent: 0.14, volume: 450000, dividendYield: 9.2, lastDividend: 0.80, sector: 'Papel' },
  { ticker: 'MXRF11', price: 10.25, change: -0.02, changePercent: -0.19, volume: 890000, dividendYield: 11.5, lastDividend: 0.10, sector: 'Híbrido' },
  { ticker: 'HGLG11', price: 165.40, change: 0.85, changePercent: 0.52, volume: 120000, dividendYield: 8.8, lastDividend: 1.20, sector: 'Logístico' },
  { ticker: 'XPLG11', price: 92.15, change: -0.45, changePercent: -0.49, volume: 280000, dividendYield: 9.5, lastDividend: 0.72, sector: 'Logístico' },
  { ticker: 'KNRI11', price: 142.80, change: 1.20, changePercent: 0.85, volume: 180000, dividendYield: 7.8, lastDividend: 0.92, sector: 'Lajes Corporativas' },
  { ticker: 'HFOF11', price: 8.45, change: 0.05, changePercent: 0.60, volume: 560000, dividendYield: 10.2, lastDividend: 0.07, sector: 'Fundo de Fundos' },
  { ticker: 'VISC11', price: 110.30, change: -0.80, changePercent: -0.72, volume: 150000, dividendYield: 8.4, lastDividend: 0.77, sector: 'Shoppings' },
  { ticker: 'BTLG11', price: 98.50, change: 0.35, changePercent: 0.36, volume: 200000, dividendYield: 9.1, lastDividend: 0.75, sector: 'Logístico' },
];

// ============ API SERVICE ============

/**
 * Busca dados de mercado para um ticker específico
 */
export async function getMarketData(ticker: string): Promise<MarketData | null> {
  try {
    const url = API_KEY ? `${BASE_URL}/${ticker.toUpperCase()}?token=${API_KEY}` : `${BASE_URL}/${ticker.toUpperCase()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const res = data.results[0];
      return {
        ticker: res.symbol,
        price: res.regularMarketPrice,
        change: res.regularMarketChange,
        changePercent: res.regularMarketChangePercent,
        volume: res.regularMarketVolume,
        dividendYield: res.dividendYield,
        sector: res.sector
      };
    }
  } catch (error) {
    console.warn(`Erro ao buscar dados reais para ${ticker}, usando mock...`);
  }

  const mock = MOCK_MARKET_DATA.find(d => d.ticker === ticker.toUpperCase());
  return mock || null;
}

/**
 * Busca dados de múltiplos tickers
 */
export async function getMultipleMarketData(tickers: string[]): Promise<MarketData[]> {
  try {
    const symbols = tickers.map(t => t.toUpperCase()).join(',');
    const url = API_KEY ? `${BASE_URL}/${symbols}?token=${API_KEY}` : `${BASE_URL}/${symbols}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results) {
      return data.results.map((res: any) => ({
        ticker: res.symbol,
        price: res.regularMarketPrice,
        change: res.regularMarketChange,
        changePercent: res.regularMarketChangePercent,
        volume: res.regularMarketVolume,
        dividendYield: res.dividendYield,
        sector: res.sector
      }));
    }
  } catch (error) {
    console.warn("Erro ao buscar múltiplos dados reais, usando mock...");
  }

  return tickers
    .map(t => MOCK_MARKET_DATA.find(d => d.ticker === t.toUpperCase()))
    .filter((d): d is MarketData => d !== undefined);
}

/**
 * Busca todas as oportunidades de investimento
 * Calcula score baseado em dados reais da Brapi
 */
export async function getInvestmentOpportunities(): Promise<{ data: InvestmentOpportunity[], isReal: boolean }> {
  const tickers = MOCK_MARKET_DATA.map(d => d.ticker);
  let marketData: MarketData[] = [];
  let isReal = false;

  try {
    const symbols = tickers.join(',');
    const url = API_KEY ? `${BASE_URL}/${symbols}?token=${API_KEY}` : `${BASE_URL}/${symbols}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      marketData = data.results.map((res: any) => ({
        ticker: res.symbol,
        price: res.regularMarketPrice,
        change: res.regularMarketChange,
        changePercent: res.regularMarketChangePercent,
        volume: res.regularMarketVolume,
        dividendYield: res.dividendYield || 0,
        sector: res.sector
      }));
      isReal = true;
    } else {
      marketData = MOCK_MARKET_DATA;
    }
  } catch (error) {
    console.warn("Erro ao buscar oportunidades reais, usando fallback mock...");
    marketData = MOCK_MARKET_DATA;
    isReal = false;
  }

  const processedData = marketData.map(data => {
    const type: InvestmentType = data.ticker.endsWith('11') ? 'fii' : 'stock';

    // Cálculo de score (0-100) baseado em dados reais
    const divScore = Math.min((data.dividendYield || 0) * 5, 40); 
    const trendScore = data.changePercent > 0 ? 20 : data.changePercent > -2 ? 10 : 0;
    const volumeScore = Math.min(data.volume / 1000000, 20); 
    const stabilityScore = 20; 

    const score = Math.min(divScore + trendScore + volumeScore + stabilityScore, 100);

    // Recomendação baseada no score
    let recommendation: InvestmentOpportunity['recommendation'];
    if (score >= 80) recommendation = 'strong_buy';
    else if (score >= 60) recommendation = 'buy';
    else if (score >= 40) recommendation = 'hold';
    else recommendation = 'sell';

    return {
      ticker: data.ticker,
      name: getStockName(data.ticker),
      type,
      currentPrice: data.price,
      dividendYield: data.dividendYield || 0,
      roi: data.changePercent,
      trend30d: data.changePercent * 3 + (Math.random() * 2 - 1), 
      trend90d: data.changePercent * 8 + (Math.random() * 4 - 2), 
      score: Math.round(score),
      recommendation,
    };
  }).sort((a, b) => b.score - a.score);

  return { data: processedData, isReal };
}

/**
 * Atualiza preços dos investimentos do usuário
 * Em produção, isso viria da API em tempo real
 */
export async function updateInvestmentPrices(userTickers: string[]): Promise<Map<string, number>> {
  await simulateNetworkDelay(400);

  const prices = new Map<string, number>();
  userTickers.forEach(ticker => {
    const data = MOCK_MARKET_DATA.find(d => d.ticker === ticker.toUpperCase());
    if (data) {
      // Adiciona pequena variação aleatória para simular mercado
      const variation = (Math.random() - 0.5) * 0.5;
      prices.set(ticker, data.price + variation);
    }
  });

  return prices;
}

/**
 * Busca setores disponíveis para filtro
 */
export async function getSectors(): Promise<string[]> {
  const sectors = new Set(MOCK_MARKET_DATA.map(d => d.sector || 'Outros'));
  return Array.from(sectors).sort();
}

// ============ HELPERS ============

function simulateNetworkDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getStockName(ticker: string): string {
  const names: Record<string, string> = {
    'PETR4': 'Petrobras PN',
    'VALE3': 'Vale ON',
    'ITUB4': 'Itaú Unibanco PN',
    'BBDC4': 'Bradesco PN',
    'ABEV3': 'Ambev ON',
    'WEGE3': 'Weg ON',
    'RENT3': 'Localiza ON',
    'BBAS3': 'Banco do Brasil ON',
    'SUZB3': 'Suzano ON',
    'LREN3': 'Lojas Renner ON',
    'KNCR11': 'Kinea Rendimentos',
    'MXRF11': 'Maxima Renda',
    'HGLG11': 'CSHG Logística',
    'XPLG11': 'XP Log',
    'KNRI11': 'Kinea Índices',
    'HFOF11': 'Hedge TOP FOFII',
    'VISC11': 'Vinci Shoppings',
    'BTLG11': 'BTG Logística',
  };
  return names[ticker] || ticker;
}

// ============ INTEGRACAO COM API REAL (FUTURO) ============

/**
 * Exemplo de como seria a implementacao com API real (Yahoo Finance)
 * Descomentar quando tiver API key
 */
/*
export async function getRealMarketData(ticker: string): Promise<MarketData> {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.SA`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch data for ${ticker}`);
  }

  const data = await response.json();
  const result = data.chart.result[0];
  const meta = result.meta;
  const quote = result.indicators.quote[0];

  const price = meta.regularMarketPrice;
  const prevClose = meta.previousClose;
  const change = price - prevClose;
  const changePercent = (change / prevClose) * 100;

  return {
    ticker: ticker.toUpperCase(),
    price,
    change,
    changePercent,
    volume: meta.regularMarketVolume,
  };
}
*/

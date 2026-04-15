/**
 * Serviço de integração com dados de mercado (B3)
 * 
 * Consome dados cacheados do backend (Alpha Vantage via server.js)
 * O server.js busca cotações 1x por dia após o fechamento da B3 (18:05)
 * e armazena em marketData.json para servir instantaneamente ao frontend.
 */

import type { MarketData, InvestmentOpportunity, InvestmentType } from '../types';

// ============ API CACHE SERVICE ============

interface CachedTicker {
  ticker: string;
  name: string;
  type: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  dividendYield: number;
  previousClose: number;
}

interface MarketDataCache {
  lastUpdated: string | null;
  successCount: number;
  failCount: number;
  totalTickers: number;
  tickers: CachedTicker[];
}

// Cache local em memória para evitar chamadas repetidas ao backend
let memoryCache: MarketDataCache | null = null;
let memoryCacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos de cache local

/**
 * Busca dados de mercado do backend (cache Alpha Vantage)
 */
async function fetchMarketDataFromBackend(): Promise<MarketDataCache> {
  // Se temos cache recente em memória, usa ele
  if (memoryCache && (Date.now() - memoryCacheTimestamp) < CACHE_TTL) {
    return memoryCache;
  }

  try {
    const response = await fetch('/api/market-data');
    const result = await response.json();
    
    if (result.success && result.data) {
      memoryCache = result.data;
      memoryCacheTimestamp = Date.now();
      return result.data;
    }
  } catch (error) {
    console.warn('Erro ao buscar dados de mercado do backend:', error);
  }
  
  // Fallback: retorna cache antigo ou vazio
  return memoryCache || { lastUpdated: null, successCount: 0, failCount: 0, totalTickers: 0, tickers: [] };
}

/**
 * Converte um ticker do cache para o formato MarketData do frontend
 */
function toMarketData(cached: CachedTicker): MarketData {
  return {
    ticker: cached.ticker,
    price: cached.price,
    change: cached.change,
    changePercent: cached.changePercent,
    volume: cached.volume,
    dividendYield: cached.dividendYield,
    sector: cached.sector,
  };
}

/**
 * Busca dados de mercado para um ticker específico
 */
export async function getMarketData(ticker: string): Promise<MarketData | null> {
  const cache = await fetchMarketDataFromBackend();
  const found = cache.tickers.find(t => t.ticker === ticker.toUpperCase());
  return found ? toMarketData(found) : null;
}

/**
 * Busca dados de múltiplos tickers
 */
export async function getMultipleMarketData(tickers: string[]): Promise<MarketData[]> {
  const cache = await fetchMarketDataFromBackend();
  return tickers
    .map(t => cache.tickers.find(ct => ct.ticker === t.toUpperCase()))
    .filter((t): t is CachedTicker => t !== undefined)
    .map(toMarketData);
}

/**
 * Busca todas as oportunidades de investimento
 * Calcula score baseado em dados reais da Alpha Vantage
 */
export async function getInvestmentOpportunities(): Promise<{ data: InvestmentOpportunity[], isReal: boolean }> {
  const cache = await fetchMarketDataFromBackend();
  
  const isReal = cache.lastUpdated !== null && cache.tickers.length > 0;
  const marketData = cache.tickers;
  
  if (marketData.length === 0) {
    return { data: [], isReal: false };
  }

  const processedData = marketData.map(data => {
    const type: InvestmentType = data.type === 'fii' ? 'fii' : 'stock';

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
      name: data.name,
      type,
      currentPrice: data.price,
      dividendYield: data.dividendYield || 0,
      roi: data.changePercent,
      trend30d: data.changePercent * 3,
      trend90d: data.changePercent * 8,
      score: Math.round(score),
      recommendation,
    };
  }).sort((a, b) => b.score - a.score);

  return { data: processedData, isReal };
}

/**
 * Atualiza preços dos investimentos do usuário
 */
export async function updateInvestmentPrices(userTickers: string[]): Promise<Map<string, number>> {
  const cache = await fetchMarketDataFromBackend();

  const prices = new Map<string, number>();
  userTickers.forEach(ticker => {
    const data = cache.tickers.find(t => t.ticker === ticker.toUpperCase());
    if (data) {
      prices.set(ticker, data.price);
    }
  });

  return prices;
}

/**
 * Busca setores disponíveis para filtro
 */
export async function getSectors(): Promise<string[]> {
  const cache = await fetchMarketDataFromBackend();
  const sectors = new Set(cache.tickers.map(t => t.sector || 'Outros'));
  return Array.from(sectors).sort();
}

/**
 * Retorna informações sobre a última atualização do cache
 */
export async function getMarketDataStatus(): Promise<{ lastUpdated: string | null, totalTickers: number, isReal: boolean }> {
  const cache = await fetchMarketDataFromBackend();
  return {
    lastUpdated: cache.lastUpdated,
    totalTickers: cache.tickers.length,
    isReal: cache.lastUpdated !== null && cache.tickers.length > 0,
  };
}

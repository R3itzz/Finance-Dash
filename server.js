import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const USERS_FILE = path.join(__dirname, 'users.json');
const FINANCE_FILE = path.join(__dirname, 'financeData.json');

// Security middleware - helmet with CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Limitar tamanho do corpo para prevenir attacks DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Função de sanitização simples para preveni XSS
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  return input;
};

// Logging de segurança
const securityLog = (message, details = {}) => {
  console.log('[SECURITY]', new Date().toISOString(), message, JSON.stringify(details));
};

// Rate limiting para auth (prevenir brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts, please try again later.' }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: 'Rate limit exceeded.' }
});

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const providedToken = authHeader && authHeader.split(' ')[1];
    const validToken = process.env.API_TOKEN;

    if (!providedToken || !validToken) {
      securityLog('Missing token', { path: req.path, ip: req.ip });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Timing-safe comparison
    if (providedToken.length !== validToken.length) {
      securityLog('Invalid token length', { path: req.path });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let match = true;
    for (let i = 0; i < providedToken.length; i++) {
      if (providedToken.charCodeAt(i) !== validToken.charCodeAt(i)) {
        match = false;
      }
    }

    if (!match) {
      securityLog('Invalid token attempt', { path: req.path, ip: req.ip });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
  } catch (error) {
    console.error('[AUTH] Token validation error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post('/api/login', authLimiter, async (req, res) => {
  // Sanitizar inputs
  const rawEmail = req.body.email;
  const rawPassword = req.body.password;
  
  if (!rawEmail || !rawPassword) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(rawEmail)) {
    securityLog('Invalid email format attempt', { email: rawEmail });
    return res.status(400).json({ error: 'Formato de email inválido.' });
  }
  
  const email = sanitizeInput(rawEmail);
  const password = rawPassword;

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

  if (ADMIN_EMAIL && ADMIN_PASSWORD_HASH && email === ADMIN_EMAIL) {
    const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (valid) {
      return res.json({
        success: true,
        user: { id: 'admin', name: 'Nicolas Reitz', email, role: 'admin' }
      });
    }
  }

  try {
    const users = await readUsers();
    const userExists = users.find(u => u.email === email);
    if (!userExists) {
      return res.status(404).json({ error: 'Usuário não encontrado.', notFound: true });
    }

    const user = users.find(u => u.email === email);
    const validPassword = await bcrypt.compare(password, user.password);

    if (validPassword) {
      const { password, ...userWithoutPassword } = user;
      return res.json({ success: true, user: userWithoutPassword });
    } else {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/register', authLimiter, async (req, res) => {
  const rawName = req.body.name;
  const rawEmail = req.body.email;
  const rawPassword = req.body.password;

  if (!rawName || !rawEmail || !rawPassword) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  // Validar e sanitizar
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(rawEmail)) {
    securityLog('Invalid email format in register', { email: rawEmail });
    return res.status(400).json({ error: 'Formato de email inválido.' });
  }

  if (rawPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const name = sanitizeInput(rawName);
  const email = sanitizeInput(rawEmail);
  const password = rawPassword;

  try {
    const users = await readUsers();
    
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword
    };

    users.push(newUser);
    await writeUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ success: true, user: userWithoutPassword });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await readUsers();
    const cleanUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    cleanUsers.push({
      id: 'admin',
      name: 'Nicolas Reitz',
      email: process.env.ADMIN_EMAIL || 'nicolasreitz46@gmail.com',
      role: 'admin'
    });
    res.json({ success: true, users: cleanUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  if (id === 'admin') {
    return res.status(403).json({ error: 'Operação bloqueada. Você não pode deletar o ROOT master.' });
  }

  try {
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado no banco de dados.' });
    }
    
    users.splice(userIndex, 1);
    await writeUsers(users);
    
    res.json({ success: true, message: 'Usuário removido com sucesso.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

async function readFinanceData() {
  try {
    const data = await fs.readFile(FINANCE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function writeFinanceData(data) {
  await fs.writeFile(FINANCE_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/finance/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const allData = await readFinanceData();
    const userData = allData[userId] || { incomes: [], expenses: [], investments: [] };
    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error reading finance data:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/finance/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { incomes, expenses, investments } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const allData = await readFinanceData();
    
    allData[userId] = {
      incomes: incomes || [],
      expenses: expenses || [],
      investments: investments || []
    };
    
    await writeFinanceData(allData);
    res.json({ success: true, message: 'Finance data synced successfully.' });
  } catch (error) {
    console.error('Error writing finance data:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const SETTINGS_FILE = path.join(__dirname, 'userSettings.json');

async function readSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function writeSettings(data) {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/settings/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const allSettings = await readSettings();
    const userSettings = allSettings[userId] || {
      metaMensal: 0,
      darkMode: false,
      activeTab: 'assinaturas'
    };
    res.json({ success: true, settings: userSettings });
  } catch (error) {
    console.error('Error reading settings:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/settings/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const settings = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const allSettings = await readSettings();
    
    allSettings[userId] = {
      ...allSettings[userId],
      ...settings,
      updatedAt: new Date().toISOString()
    };
    
    await writeSettings(allSettings);
    res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const SUBSCRIPTIONS_FILE = path.join(__dirname, 'subscriptions.json');

async function readSubscriptions() {
  try {
    const data = await fs.readFile(SUBSCRIPTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function writeSubscriptions(data) {
  await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/subscriptions/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const allSubs = await readSubscriptions();
    const userSubs = allSubs[userId] || [];
    res.json({ success: true, subscriptions: userSubs });
  } catch (error) {
    console.error('Error reading subscriptions:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/subscriptions/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { subscriptions } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const allSubs = await readSubscriptions();
    
    allSubs[userId] = subscriptions || [];
    
    await writeSubscriptions(allSubs);
    res.json({ success: true, message: 'Subscriptions saved successfully.' });
  } catch (error) {
    console.error('Error saving subscriptions:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const GOALS_FILE = path.join(__dirname, 'goals.json');

async function readGoals() {
  try {
    const data = await fs.readFile(GOALS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function writeGoals(data) {
  await fs.writeFile(GOALS_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/goals/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const allGoals = await readGoals();
    const userGoals = allGoals[userId] || [];
    res.json({ success: true, goals: userGoals });
  } catch (error) {
    console.error('Error reading goals:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/goals/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { goals } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const allGoals = await readGoals();
    allGoals[userId] = goals || [];
    await writeGoals(allGoals);
    res.json({ success: true, message: 'Goals saved successfully.' });
  } catch (error) {
    console.error('Error saving goals:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
const MARKET_DATA_FILE = path.join(__dirname, 'marketData.json');

const TRACKED_TICKERS = [
  { ticker: 'PETR4', symbol: 'PETR4.SAO', name: 'Petrobras PN', type: 'stock', sector: 'Petróleo', dividendYield: 7.2 },
  { ticker: 'VALE3', symbol: 'VALE3.SAO', name: 'Vale ON', type: 'stock', sector: 'Mineração', dividendYield: 8.5 },
  { ticker: 'ITUB4', symbol: 'ITUB4.SAO', name: 'Itaú Unibanco PN', type: 'stock', sector: 'Financeiro', dividendYield: 3.8 },
  { ticker: 'BBDC4', symbol: 'BBDC4.SAO', name: 'Bradesco PN', type: 'stock', sector: 'Financeiro', dividendYield: 6.2 },
  { ticker: 'ABEV3', symbol: 'ABEV3.SAO', name: 'Ambev ON', type: 'stock', sector: 'Bebidas', dividendYield: 4.1 },
  { ticker: 'WEGE3', symbol: 'WEGE3.SAO', name: 'Weg ON', type: 'stock', sector: 'Bens Industriais', dividendYield: 1.2 },
  { ticker: 'RENT3', symbol: 'RENT3.SAO', name: 'Localiza ON', type: 'stock', sector: 'Locação', dividendYield: 1.8 },
  { ticker: 'BBAS3', symbol: 'BBAS3.SAO', name: 'Banco do Brasil ON', type: 'stock', sector: 'Financeiro', dividendYield: 8.9 },
  { ticker: 'SUZB3', symbol: 'SUZB3.SAO', name: 'Suzano ON', type: 'stock', sector: 'Papel e Celulose', dividendYield: 1.5 },
  { ticker: 'LREN3', symbol: 'LREN3.SAO', name: 'Lojas Renner ON', type: 'stock', sector: 'Varejo', dividendYield: 1.1 },
  { ticker: 'KNCR11', symbol: 'KNCR11.SAO', name: 'Kinea Rendimentos', type: 'fii', sector: 'Papel', dividendYield: 9.2 },
  { ticker: 'MXRF11', symbol: 'MXRF11.SAO', name: 'Maxi Renda', type: 'fii', sector: 'Híbrido', dividendYield: 11.5 },
  { ticker: 'HGLG11', symbol: 'HGLG11.SAO', name: 'CSHG Logística', type: 'fii', sector: 'Logístico', dividendYield: 8.8 },
  { ticker: 'XPLG11', symbol: 'XPLG11.SAO', name: 'XP Log', type: 'fii', sector: 'Logístico', dividendYield: 9.5 },
  { ticker: 'KNRI11', symbol: 'KNRI11.SAO', name: 'Kinea Renda Imobiliária', type: 'fii', sector: 'Lajes Corporativas', dividendYield: 7.8 },
  { ticker: 'HFOF11', symbol: 'HFOF11.SAO', name: 'Hedge TOP FOFII', type: 'fii', sector: 'Fundo de Fundos', dividendYield: 10.2 },
  { ticker: 'VISC11', symbol: 'VISC11.SAO', name: 'Vinci Shoppings', type: 'fii', sector: 'Shoppings', dividendYield: 8.4 },
  { ticker: 'BTLG11', symbol: 'BTLG11.SAO', name: 'BTG Logística', type: 'fii', sector: 'Logístico', dividendYield: 9.1 },
  { ticker: 'XPML11', symbol: 'XPML11.SAO', name: 'XP Malls', type: 'fii', sector: 'Shoppings', dividendYield: 8.0 },
  { ticker: 'BCFF11', symbol: 'BCFF11.SAO', name: 'BTG Fundo de Fundos', type: 'fii', sector: 'Fundo de Fundos', dividendYield: 9.8 },
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let isUpdating = false;
let updatePromise = null;

async function readMarketData() {
  try {
    const data = await fs.readFile(MARKET_DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { lastUpdated: null, tickers: [] };
    }
    throw error;
  }
}

async function writeMarketData(data) {
  await fs.writeFile(MARKET_DATA_FILE, JSON.stringify(data, null, 2));
}

async function fetchYahooQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.quoteResponse && data.quoteResponse.result && data.quoteResponse.result[0]) {
    const q = data.quoteResponse.result[0];
    return {
      price: q.regularMarketPrice || 0,
      change: q.regularMarketChange || 0,
      changePercent: q.regularMarketChangePercent || 0,
      volume: q.regularMarketVolume || 0,
      previousClose: q.regularMarketPreviousClose || q.regularMarketPrice || 0,
    };
  }
  
  return null;
}

async function updateAllMarketData() {
  console.log('[Yahoo Finance] Starting market data update...');
  
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (const entry of TRACKED_TICKERS) {
    try {
      const quote = await fetchYahooQuote(entry.symbol);
      
      if (quote) {
        results.push({
          ticker: entry.ticker,
          name: entry.name,
          type: entry.type,
          sector: entry.sector,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume,
          dividendYield: entry.dividendYield,
          previousClose: quote.previousClose,
        });
        successCount++;
        console.log(`  ✓ ${entry.ticker}: R$ ${quote.price.toFixed(2)} (${quote.changePercent > 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`);
      } else {
        failCount++;
        console.log(`  ✗ ${entry.ticker}: failed, using cached data`);
      }
    } catch (error) {
      failCount++;
      console.error(`  ✗ ${entry.ticker}: error - ${error.message}`);
    }
    
    await sleep(200);
  }
  
  const oldData = await readMarketData();
  const oldTickers = oldData.tickers || [];
  
  for (const entry of TRACKED_TICKERS) {
    const hasNew = results.find(r => r.ticker === entry.ticker);
    if (!hasNew) {
      const old = oldTickers.find(o => o.ticker === entry.ticker);
      if (old) {
        results.push(old);
      }
    }
  }
  
  const marketData = {
    lastUpdated: new Date().toISOString(),
    successCount,
    failCount,
    totalTickers: TRACKED_TICKERS.length,
    tickers: results,
  };
  
  await writeMarketData(marketData);
  console.log(`[Yahoo Finance] Update complete! ${successCount} OK, ${failCount} failures.`);
  
  return marketData;
}

app.get('/api/market-data', apiLimiter, async (req, res) => {
  try {
    const data = await readMarketData();
    
    if (!data.lastUpdated || data.tickers.length === 0) {
      if (isUpdating && updatePromise) {
        console.log('[Yahoo Finance] Update in progress, waiting...');
        const freshData = await updatePromise;
        return res.json({ success: true, data: freshData });
      }
      
      console.log('[Yahoo Finance] Cache empty, starting first fetch...');
      isUpdating = true;
      updatePromise = updateAllMarketData();
      
      try {
        const freshData = await updatePromise;
        return res.json({ success: true, data: freshData });
      } finally {
        isUpdating = false;
        updatePromise = null;
      }
    }
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error reading market data:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/market-data/refresh', authenticateToken, async (req, res) => {
  try {
    const data = await updateAllMarketData();
    res.json({ success: true, data, message: 'Dados atualizados com sucesso!' });
  } catch (error) {
    console.error('Error updating market data:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

cron.schedule('5 18 * * 1-5', () => {
  console.log('[CRON] Running daily market update (18:05)...');
  updateAllMarketData().catch(err => console.error('[CRON] Error:', err));
}, {
  timezone: 'America/Sao_Paulo'
});

app.listen(PORT, () => {
  console.log(`[Finance Dashboard] Server running on http://localhost:${PORT}`);
  console.log(`[Yahoo Finance] Monitoring ${TRACKED_TICKERS.length} tickers`);
  console.log(`[CRON] Auto-update: Mon-Fri at 18:05 (Brasília Time)`);
});

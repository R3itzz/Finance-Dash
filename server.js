import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const USERS_FILE = path.join(__dirname, 'users.json');
const FINANCE_FILE = path.join(__dirname, 'financeData.json');

app.use(cors());
app.use(express.json());

// Helper to read users from file
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper to write users to file
async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Check Admin Login First
  if (email === 'nicolasreitz46@gmail.com' && password === 'nicolas16739') {
    return res.json({
      success: true,
      user: { id: 'admin', name: 'Nicolas Reitz', email: 'nicolasreitz46@gmail.com', role: 'admin' }
    });
  }

  try {
    const users = await readUsers();
    
    // Check if the email exists at all
    const userExists = users.find(u => u.email === email);
    if (!userExists) {
      return res.status(404).json({ error: 'Usuário não encontrado.', notFound: true });
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Don't send password back to the client
      const { password, ...userWithoutPassword } = user;
      return res.json({ success: true, user: userWithoutPassword });
    } else {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Register Route
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const users = await readUsers();
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password // Note: Storing plain text password as per simple implementation request
    };

    users.push(newUser);
    await writeUsers(users);

    // Filter password out from response
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ success: true, user: userWithoutPassword });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Admin Route: Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await readUsers();
    const cleanUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    // Append the hardcoded admin so it appears in the list
    cleanUsers.push({
      id: 'admin',
      name: 'Nicolas Reitz',
      email: 'nicolasreitz46@gmail.com',
      role: 'admin'
    });
    res.json({ success: true, users: cleanUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Admin Route: Delete user
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  
  // Protect admin
  if (id === 'admin') {
    return res.status(403).json({ error: 'Operação bloqueada. Você não pode deletar o ROOT master.' });
  }

  try {
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado no banco de dados.' });
    }
    
    // Remove the user from the array
    users.splice(userIndex, 1);
    await writeUsers(users);
    
    res.json({ success: true, message: 'Usuário removido com sucesso.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Helper to read finance data
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

// Helper to write finance data
async function writeFinanceData(data) {
  await fs.writeFile(FINANCE_FILE, JSON.stringify(data, null, 2));
}

// Get user financial data
app.get('/api/finance/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const allData = await readFinanceData();
    const userData = allData[userId] || { incomes: [], expenses: [], investments: [] };
    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error reading finance data:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Update user financial data
app.post('/api/finance/:userId', async (req, res) => {
  const { userId } = req.params;
  const { incomes, expenses, investments } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const allData = await readFinanceData();
    
    // Update or create user's financial block
    allData[userId] = {
      incomes: incomes || [],
      expenses: expenses || [],
      investments: investments || []
    };
    
    await writeFinanceData(allData);
    res.json({ success: true, message: 'Finance data synced successfully.' });
  } catch (error) {
    console.error('Error writing finance data:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// ============================================================
// ALPHA VANTAGE - CACHE DIÁRIO DE DADOS DE MERCADO
// ============================================================

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY || 'NR096KPY613ACTX2';
const MARKET_DATA_FILE = path.join(__dirname, 'marketData.json');

// 10 Ações + 10 FIIs = 20 tickers (dentro do limite de 25 chamadas/dia)
const TRACKED_TICKERS = [
  // === 10 AÇÕES ===
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
  // === 10 FIIs ===
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

// Helper: espera X milissegundos
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: lê cache do disco
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

// Helper: salva cache no disco
async function writeMarketData(data) {
  await fs.writeFile(MARKET_DATA_FILE, JSON.stringify(data, null, 2));
}

// Busca um ticker individual na Alpha Vantage (GLOBAL_QUOTE)
async function fetchAlphaVantageQuote(symbol) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data['Global Quote'] && data['Global Quote']['05. price']) {
    const q = data['Global Quote'];
    return {
      price: parseFloat(q['05. price']),
      change: parseFloat(q['09. change']),
      changePercent: parseFloat(q['10. change percent']?.replace('%', '') || '0'),
      volume: parseInt(q['06. volume'] || '0', 10),
      previousClose: parseFloat(q['08. previous close'] || '0'),
    };
  }
  
  // Se recebemos um aviso de rate limit ou erro
  if (data['Information'] || data['Note']) {
    console.warn(`[Alpha Vantage] Rate limit atingido para ${symbol}:`, data['Information'] || data['Note']);
    return null;
  }
  
  return null;
}

// Atualiza TODOS os tickers em sequência (respeitando 1 req/segundo)
async function updateAllMarketData() {
  console.log('[Alpha Vantage] Iniciando atualização de mercado...');
  
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (const entry of TRACKED_TICKERS) {
    try {
      const quote = await fetchAlphaVantageQuote(entry.symbol);
      
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
        // Falhou, usa dados antigos se existirem
        failCount++;
        console.log(`  ✗ ${entry.ticker}: falhou, será mantido o cache anterior`);
      }
    } catch (error) {
      failCount++;
      console.error(`  ✗ ${entry.ticker}: erro - ${error.message}`);
    }
    
    // Espera 1.5s entre cada requisição (margem de segurança)
    await sleep(1500);
  }
  
  // Mescla com dados antigos (mantém tickers que falharam)
  const oldData = await readMarketData();
  const oldTickers = oldData.tickers || [];
  
  // Para cada ticker que falhou, tenta manter o dado antigo
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
  console.log(`[Alpha Vantage] Atualização concluída! ${successCount} OK, ${failCount} falhas.`);
  
  return marketData;
}

// API: Retorna dados de mercado cacheados para o frontend
app.get('/api/market-data', async (req, res) => {
  try {
    const data = await readMarketData();
    
    // Se nunca foi atualizado, faz uma primeira busca
    if (!data.lastUpdated || data.tickers.length === 0) {
      console.log('[Alpha Vantage] Cache vazio, iniciando primeira busca...');
      const freshData = await updateAllMarketData();
      return res.json({ success: true, data: freshData });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao ler dados de mercado:', error);
    res.status(500).json({ error: 'Erro ao ler dados de mercado: ' + error.message });
  }
});

// API: Forçar atualização manual (Admin only)
app.post('/api/market-data/refresh', async (req, res) => {
  try {
    const data = await updateAllMarketData();
    res.json({ success: true, data, message: 'Dados atualizados com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar dados de mercado:', error);
    res.status(500).json({ error: 'Erro ao atualizar: ' + error.message });
  }
});

// CRON JOB: Atualiza automaticamente de segunda a sexta às 18:05 (após fechamento B3)
cron.schedule('5 18 * * 1-5', () => {
  console.log('[CRON] Executando atualização diária de mercado (18:05)...');
  updateAllMarketData().catch(err => console.error('[CRON] Erro:', err));
}, {
  timezone: 'America/Sao_Paulo'
});

app.listen(PORT, () => {
  console.log(`[Finance Dashboard] Server running on http://localhost:${PORT}`);
  console.log(`[Alpha Vantage] Monitorando ${TRACKED_TICKERS.length} tickers (10 ações + 10 FIIs)`);
  console.log(`[CRON] Atualização automática agendada: Seg-Sex às 18:05 (Horário de Brasília)`);
});


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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
    res.status(500).json({ error: 'Internal server error.' });
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
    res.status(500).json({ error: 'Internal server error.' });
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
    res.status(500).json({ error: 'Internal server error.' });
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
    res.status(500).json({ error: 'Internal server error.' });
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
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`[Finance Dashboard] Server running on http://localhost:${PORT}`);
});

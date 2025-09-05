const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { format, subDays, addDays } = require('date-fns');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

let users = [];
let transactions = [];
let accounts = [];

const initializeData = () => {
  const hashedPassword = bcrypt.hashSync('password123', 10);
  const userId = uuidv4();
  
  users.push({
    id: userId,
    email: 'demo@bank.com',
    password: hashedPassword,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date().toISOString()
  });

  const accountId = uuidv4();
  accounts.push({
    id: accountId,
    userId: userId,
    accountNumber: '1234567890',
    accountType: 'checking',
    balance: 5420.75,
    createdAt: new Date().toISOString()
  });

  const transactionTypes = ['deposit', 'withdrawal', 'transfer', 'payment'];
  const merchants = ['Amazon', 'Starbucks', 'Gas Station', 'Grocery Store', 'ATM Withdrawal', 'Direct Deposit', 'Online Transfer'];
  
  for (let i = 0; i < 20; i++) {
    const isDebit = Math.random() > 0.6;
    const amount = parseFloat((Math.random() * 500 + 10).toFixed(2));
    
    transactions.push({
      id: uuidv4(),
      accountId: accountId,
      type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
      amount: isDebit ? -amount : amount,
      description: merchants[Math.floor(Math.random() * merchants.length)],
      category: isDebit ? 'expense' : 'income',
      date: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
      status: 'completed',
      createdAt: new Date().toISOString()
    });
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/accounts', authenticateToken, (req, res) => {
  try {
    const userAccounts = accounts.filter(account => account.userId === req.user.userId);
    res.json(userAccounts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/accounts/:accountId/transactions', authenticateToken, (req, res) => {
  try {
    const { accountId } = req.params;
    const { limit = 50, offset = 0, startDate, endDate } = req.query;
    
    const account = accounts.find(acc => acc.id === accountId && acc.userId === req.user.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    let accountTransactions = transactions.filter(t => t.accountId === accountId);
    
    if (startDate) {
      accountTransactions = accountTransactions.filter(t => new Date(t.date) >= new Date(startDate));
    }
    if (endDate) {
      accountTransactions = accountTransactions.filter(t => new Date(t.date) <= new Date(endDate));
    }
    
    accountTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const paginatedTransactions = accountTransactions.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      transactions: paginatedTransactions,
      total: accountTransactions.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/accounts/:accountId/analytics', authenticateToken, (req, res) => {
  try {
    const { accountId } = req.params;
    const { period = '30' } = req.query; // days
    
    const account = accounts.find(acc => acc.id === accountId && acc.userId === req.user.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const periodDays = parseInt(period);
    const startDate = subDays(new Date(), periodDays);
    
    const periodTransactions = transactions.filter(t => 
      t.accountId === accountId && new Date(t.date) >= startDate
    );

    const totalIncome = periodTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = Math.abs(periodTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const categoryBreakdown = periodTransactions.reduce((acc, t) => {
      const category = t.category;
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 };
      }
      acc[category].total += Math.abs(t.amount);
      acc[category].count += 1;
      return acc;
    }, {});

    res.json({
      period: periodDays,
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netAmount: parseFloat((totalIncome - totalExpenses).toFixed(2)),
      transactionCount: periodTransactions.length,
      categoryBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/accounts/:accountId/transactions', authenticateToken, (req, res) => {
  try {
    const { accountId } = req.params;
    const { type, amount, description, category } = req.body;
    
    const account = accounts.find(acc => acc.id === accountId && acc.userId === req.user.userId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (!type || !amount || !description) {
      return res.status(400).json({ error: 'Type, amount, and description are required' });
    }

    const transaction = {
      id: uuidv4(),
      accountId: accountId,
      type,
      amount: parseFloat(amount),
      description,
      category: category || (amount > 0 ? 'income' : 'expense'),
      date: new Date().toISOString(),
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    transactions.push(transaction);
    
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);
    accounts[accountIndex].balance += parseFloat(amount);

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

initializeData();

app.listen(PORT, () => {
  console.log(`Banking API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log('Sample login credentials: demo@bank.com / password123');
});

module.exports = app;

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const testUser = {
  id: 'test-user-id',
  email: 'test@bank.com',
  password: bcrypt.hashSync('testpassword123', 10),
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date().toISOString()
};

const testAccount = {
  id: 'test-account-id',
  userId: 'test-user-id',
  accountNumber: '9876543210',
  accountType: 'checking',
  balance: 1000.00,
  createdAt: new Date().toISOString()
};

const testTransactions = [
  {
    id: uuidv4(),
    accountId: 'test-account-id',
    type: 'deposit',
    amount: 500.00,
    description: 'Test Deposit',
    category: 'income',
    date: new Date().toISOString(),
    status: 'completed',
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    accountId: 'test-account-id',
    type: 'withdrawal',
    amount: -100.00,
    description: 'Test Withdrawal',
    category: 'expense',
    date: new Date().toISOString(),
    status: 'completed',
    createdAt: new Date().toISOString()
  }
];

module.exports = {
  testUser,
  testAccount,
  testTransactions
};

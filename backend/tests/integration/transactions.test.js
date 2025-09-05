const request = require('supertest');

describe('Transaction API Endpoints', () => {
  let app;
  let validToken;
  let accountId;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key';
    app = require('../../server.js');

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@bank.com',
        password: 'password123'
      });
    
    validToken = loginResponse.body.token;

    const accountsResponse = await request(app)
      .get('/api/accounts')
      .set('Authorization', `Bearer ${validToken}`);
    
    accountId = accountsResponse.body[0].id;
  });

  describe('GET /api/accounts/:accountId/transactions', () => {
    test('should get transactions for valid account', async () => {
      const response = await request(app)
        .get(`/api/accounts/${accountId}/transactions`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('offset');
      expect(Array.isArray(response.body.transactions)).toBe(true);
    });

    test('should respect limit parameter', async () => {
      const limit = 5;
      const response = await request(app)
        .get(`/api/accounts/${accountId}/transactions?limit=${limit}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.limit).toBe(limit);
      expect(response.body.transactions.length).toBeLessThanOrEqual(limit);
    });

    test('should respect offset parameter', async () => {
      const offset = 2;
      const response = await request(app)
        .get(`/api/accounts/${accountId}/transactions?offset=${offset}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.offset).toBe(offset);
    });

    test('should filter by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const response = await request(app)
        .get(`/api/accounts/${accountId}/transactions?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      
      response.body.transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        expect(transactionDate).toBeInstanceOf(Date);
        expect(transactionDate >= new Date(startDate)).toBe(true);
        expect(transactionDate <= new Date(endDate)).toBe(true);
      });
    });

    test('should reject invalid account ID', async () => {
      const invalidAccountId = 'invalid-account-id';
      
      const response = await request(app)
        .get(`/api/accounts/${invalidAccountId}/transactions`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Account not found');
    });
  });

  describe('GET /api/accounts/:accountId/analytics', () => {
    test('should get analytics for valid account', async () => {
      const response = await request(app)
        .get(`/api/accounts/${accountId}/analytics`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('period');
      expect(response.body).toHaveProperty('totalIncome');
      expect(response.body).toHaveProperty('totalExpenses');
      expect(response.body).toHaveProperty('netAmount');
      expect(response.body).toHaveProperty('transactionCount');
      expect(response.body).toHaveProperty('categoryBreakdown');

      expect(typeof response.body.totalIncome).toBe('number');
      expect(typeof response.body.totalExpenses).toBe('number');
      expect(typeof response.body.netAmount).toBe('number');
      expect(typeof response.body.transactionCount).toBe('number');
      expect(typeof response.body.categoryBreakdown).toBe('object');
    });

    test('should respect period parameter', async () => {
      const period = 7;
      const response = await request(app)
        .get(`/api/accounts/${accountId}/analytics?period=${period}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.period).toBe(period);
    });

    test('should calculate net amount correctly', async () => {
      const response = await request(app)
        .get(`/api/accounts/${accountId}/analytics`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      const { totalIncome, totalExpenses, netAmount } = response.body;
      const expectedNetAmount = parseFloat((totalIncome - totalExpenses).toFixed(2));
      
      expect(netAmount).toBe(expectedNetAmount);
    });
  });

  describe('POST /api/accounts/:accountId/transactions', () => {
    test('should create new transaction', async () => {
      const newTransaction = {
        type: 'deposit',
        amount: 250.00,
        description: 'Test Transaction',
        category: 'income'
      };

      const response = await request(app)
        .post(`/api/accounts/${accountId}/transactions`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(newTransaction)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('accountId', accountId);
      expect(response.body).toHaveProperty('type', newTransaction.type);
      expect(response.body).toHaveProperty('amount', newTransaction.amount);
      expect(response.body).toHaveProperty('description', newTransaction.description);
      expect(response.body).toHaveProperty('category', newTransaction.category);
      expect(response.body).toHaveProperty('status', 'completed');
    });

    test('should reject transaction with missing required fields', async () => {
      const incompleteTransaction = {
        amount: 100.00
      };

      const response = await request(app)
        .post(`/api/accounts/${accountId}/transactions`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(incompleteTransaction)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Type, amount, and description are required');
    });
  });
});

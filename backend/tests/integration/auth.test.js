const request = require('supertest');
const jwt = require('jsonwebtoken');

describe('Authentication API Endpoints', () => {
  let app;
  const JWT_SECRET = 'test-secret-key';

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    app = require('../../server.js');
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const credentials = {
        email: 'demo@bank.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', credentials.email);
      expect(response.body.user).toHaveProperty('firstName');
      expect(response.body.user).not.toHaveProperty('password');

      const decoded = jwt.verify(response.body.token, JWT_SECRET);
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email', credentials.email);
    });

    test('should reject invalid email', async () => {
      const credentials = {
        email: 'nonexistent@bank.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('should reject invalid password', async () => {
      const credentials = {
        email: 'demo@bank.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('should reject missing email', async () => {
      const credentials = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    test('should reject missing password', async () => {
      const credentials = {
        email: 'demo@bank.com'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });
  });

  describe('Authentication Middleware', () => {
    let validToken;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'demo@bank.com',
          password: 'password123'
        });
      
      validToken = loginResponse.body.token;
    });

    test('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/accounts')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/accounts')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });

    test('should reject request with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/accounts')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });
  });
});

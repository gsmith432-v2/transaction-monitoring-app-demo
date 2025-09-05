const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Authentication Functions', () => {
  const JWT_SECRET = 'test-secret-key';
  
  describe('JWT Token Operations', () => {
    test('should generate valid JWT token', () => {
      const payload = { userId: 'test-user', email: 'test@bank.com' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    test('should reject invalid JWT token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        jwt.verify(invalidToken, JWT_SECRET);
      }).toThrow();
    });

    test('should reject expired JWT token', () => {
      const payload = { userId: 'test-user', email: 'test@bank.com' };
      const expiredToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1h' });
      
      expect(() => {
        jwt.verify(expiredToken, JWT_SECRET);
      }).toThrow('jwt expired');
    });
  });

  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    test('should verify correct password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });
});

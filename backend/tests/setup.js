const { beforeAll, afterAll, beforeEach, afterEach } = require('@jest/globals');

beforeAll(async () => {
  console.log('Setting up test environment...');
});

afterAll(async () => {
  console.log('Tearing down test environment...');
});

beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  jest.clearAllMocks();
});

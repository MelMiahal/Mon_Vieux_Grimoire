const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-with-sufficient-length';

const app = require('../src/app');

test('GET / returns the application welcome message', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { message: 'Bienvenue sur Mon Vieux Grimoire' });
});

test('GET /api/health confirms that the Express server is running', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('signup and login reject requests without credentials', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const signup = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  assert.equal(signup.status, 400);
  assert.equal((await signup.json()).error, 'Email and password are required');
  assert.equal(login.status, 400);
  assert.equal((await login.json()).error, 'Email and password are required');
});

test('GET /api/auth/me requires and verifies a Bearer token', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));
  const url = `http://127.0.0.1:${server.address().port}/api/auth/me`;

  const unauthenticated = await fetch(url);
  assert.equal(unauthenticated.status, 401);
  assert.equal((await unauthenticated.json()).error, 'Authentication required');

  const invalidToken = await fetch(url, {
    headers: { Authorization: 'Bearer invalid-token' },
  });
  assert.equal(invalidToken.status, 401);
  assert.equal((await invalidToken.json()).error, 'jwt malformed');

  const userId = 'test-user-id';
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1m' });
  const authenticated = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(authenticated.status, 200);
  assert.deepEqual(await authenticated.json(), { userId });
});

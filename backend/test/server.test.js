const test = require('node:test');
const assert = require('node:assert/strict');
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

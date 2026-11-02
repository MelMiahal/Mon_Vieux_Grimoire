const test = require('node:test');
const assert = require('node:assert/strict');
const connectDatabase = require('../src/config/database');

test('database connection reports a missing MongoDB URI', async () => {
  const configuredUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;

  try {
    await assert.rejects(connectDatabase(), /MONGODB_URI is not configured in backend\/\.env/);
  } finally {
    if (configuredUri === undefined) {
      delete process.env.MONGODB_URI;
    } else {
      process.env.MONGODB_URI = configuredUri;
    }
  }
});

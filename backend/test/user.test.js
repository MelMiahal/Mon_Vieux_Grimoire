const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../src/models/User');

test('User model requires a unique email and password', () => {
  const user = new User({ email: 'reader@example.com', password: 'hashed-password' });

  assert.equal(User.modelName, 'User');
  assert.equal(User.collection.name, 'users');
  assert.equal(User.schema.path('email').options.unique, true);
  assert.equal(User.schema.path('email').isRequired, true);
  assert.equal(User.schema.path('password').isRequired, true);
  assert.ok(User.schema.path('email').validators.some((validator) => validator.type === 'unique'));
  assert.equal(user.email, 'reader@example.com');
});

test('User model requires email and password', () => {
  assert.equal(User.schema.path('email').isRequired, true);
  assert.equal(User.schema.path('password').isRequired, true);
});

test('User model normalizes email casing and whitespace', () => {
  const user = new User({ email: ' Reader@Example.com ', password: 'hashed-password' });

  assert.equal(user.email, 'reader@example.com');
});

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { growwRequest } = require('../controllers/growwController');

test('growwRequest returns parsed JSON when the request succeeds', async () => {
  const previousFetch = global.fetch;
  const previousToken = process.env.GROWW_ACCESS_TOKEN;
  process.env.GROWW_ACCESS_TOKEN = 'token-123';

  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.groww.in/v1/user/detail');
    assert.equal(options.method, 'GET');
    assert.match(options.headers.Authorization, /^Bearer token-123$/);

    return {
      ok: true,
      status: 200,
      headers: { get: (name) => name === 'content-type' ? 'application/json' : null },
      json: async () => ({ success: true, user: { id: 7 } }),
    };
  };

  try {
    const data = await growwRequest('/user/detail');
    assert.deepEqual(data, { success: true, user: { id: 7 } });
  } finally {
    global.fetch = previousFetch;
    if (typeof previousToken === 'undefined') {
      delete process.env.GROWW_ACCESS_TOKEN;
    } else {
      process.env.GROWW_ACCESS_TOKEN = previousToken;
    }
  }
});

test('growwRequest surfaces API error messages and status', async () => {
  const previousFetch = global.fetch;
  const previousToken = process.env.GROWW_ACCESS_TOKEN;
  process.env.GROWW_ACCESS_TOKEN = 'token-123';

  global.fetch = async () => ({
    ok: false,
    status: 401,
    headers: { get: (name) => name === 'content-type' ? 'application/json' : null },
    json: async () => ({ message: 'Invalid session' }),
  });

  try {
    await assert.rejects(
      async () => {
        await growwRequest('/user/detail');
      },
      (error) => {
        assert.equal(error.message, 'Invalid session');
        assert.equal(error.status, 401);
        return true;
      }
    );
  } finally {
    global.fetch = previousFetch;
    if (typeof previousToken === 'undefined') {
      delete process.env.GROWW_ACCESS_TOKEN;
    } else {
      process.env.GROWW_ACCESS_TOKEN = previousToken;
    }
  }
});

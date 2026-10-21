'use strict';

/*
 * Ooha Gifts API — admin CRUD regression tests (no database needed).
 *
 * Regression guard for a real production bug: the generic crud() list handler
 * selected only the whitelisted public fields, which silently dropped `id`.
 * The admin UI keys rows by `id` and sends it back on edit / delete / toggle,
 * so banners, videos and coupons all arrived without an id — React warned
 * about missing keys and the edit/delete actions no-oped.
 *
 * The db module is stubbed into require.cache *before* the controller loads,
 * so no MySQL pool is ever created. (node --test runs each file in its own
 * process, so the stub cannot leak into other suites.)
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../config/db');
const calls = [];
let stubRows = [];
let stubFirst = null;

require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    query: async (sql, params) => { calls.push({ sql, params }); return stubRows; },
    one: async (sql, params) => { calls.push({ sql, params }); return stubFirst; },
    pool: { end: async () => {} },
  },
};

const admin = require('../controllers/adminController');

/* ---------------- tiny request/response doubles ---------------- */

function mockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

const reqOf = (params = {}, body = {}) => ({ params, body, query: {} });

const CRUD_TABLES = ['banners', 'videos', 'coupons'];

/* ---------------- list ---------------- */

test('admin list responses include the record id', async () => {
  for (const table of CRUD_TABLES) {
    calls.length = 0;
    stubRows = [{ id: 42, title: 'sample' }];

    const res = mockRes();
    await admin[table].list(reqOf(), res);

    assert.equal(res.statusCode, 200, `${table}: unexpected status`);
    assert.ok(Array.isArray(res.body[table]), `${table}: expected an array under "${table}"`);
    assert.equal(res.body[table][0].id, 42, `${table}: id missing from the payload`);

    /* the SELECT must ask for id explicitly — that was the bug */
    assert.match(calls[0].sql, /^SELECT id,/i, `${table}: SELECT does not include id first`);
  }
});

test('admin list SQL selects every whitelisted field', async () => {
  calls.length = 0;
  stubRows = [];

  await admin.banners.list(reqOf(), mockRes());

  const sql = calls[0].sql;
  for (const field of ['title', 'subtitle', 'image', 'button_text', 'button_link', 'display_order', 'active']) {
    assert.ok(sql.includes(field), `banners: SELECT is missing "${field}"`);
  }
  assert.match(sql, /FROM banners ORDER BY id DESC/i);
});

/* ---------------- update ---------------- */

test('admin update addresses the row by the id passed in the route', async () => {
  for (const table of CRUD_TABLES) {
    calls.length = 0;
    stubFirst = { id: 7 };

    const res = mockRes();
    await admin[table].update(reqOf({ id: '7' }, { active: 0 }), res);

    assert.equal(res.statusCode, 200, `${table}: unexpected status`);
    assert.equal(res.body.success, true, `${table}: expected success`);

    /* second call is the UPDATE, and its params must end with the row id */
    const update = calls[calls.length - 1];
    assert.match(update.sql, /UPDATE .* WHERE id = \?$/is, `${table}: UPDATE does not target id`);
    assert.equal(update.params[update.params.length - 1], 7, `${table}: UPDATE param id mismatch`);
  }
});

test('admin update of a missing row answers 404', async () => {
  calls.length = 0;
  stubFirst = null;

  const errors = [];
  await admin.coupons.update(reqOf({ id: '999' }, { active: 1 }), mockRes(), (err) => errors.push(err));

  assert.equal(errors.length, 1, 'expected the 404 to reach the error middleware');
  assert.equal(errors[0].status, 404);
});

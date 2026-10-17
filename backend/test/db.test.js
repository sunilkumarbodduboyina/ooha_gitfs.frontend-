'use strict';

/*
 * config/db.js — connection configuration tests.
 *
 * Verifies how the pool gets its settings (individual DB_* variables vs a
 * single DATABASE_URL). These are DB-free: creating a mysql2 pool is lazy and
 * never opens a connection, so no database or credentials are needed.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { fromUrl, pool } = require('../config/db');

test('fromUrl parses a MySQL connection URL into discrete options', () => {
  const o = fromUrl('mysql://alice:p%40ss@db.example.com:3307/mydb');
  assert.equal(o.host, 'db.example.com');
  assert.equal(o.port, 3307);
  assert.equal(o.user, 'alice');
  assert.equal(o.password, 'p@ss'); // percent-decoded
  assert.equal(o.database, 'mydb');
});

test('fromUrl accepts the mysql2 scheme too', () => {
  const o = fromUrl('mysql2://root@localhost:3306/ooha_gifts');
  assert.equal(o.host, 'localhost');
  assert.equal(o.port, 3306);
  assert.equal(o.user, 'root');
  assert.equal(o.database, 'ooha_gifts');
});

test('fromUrl defaults the port to 3306 when the URL omits one', () => {
  assert.equal(fromUrl('mysql://u:p@h/db').port, 3306);
});

test('fromUrl never throws on a malformed URL (returns {})', () => {
  assert.deepEqual(fromUrl('not-a-url'), {});
  assert.deepEqual(fromUrl(''), {});
  assert.deepEqual(fromUrl(undefined), {});
});

test('pool is created without opening a connection', () => {
  assert.ok(pool, 'pool should be defined');
  assert.equal(typeof pool.query, 'function');
  assert.equal(typeof pool.getConnection, 'function');
});

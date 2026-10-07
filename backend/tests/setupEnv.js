// Ambiente di test: DB SQLite su file temporaneo per ogni worker, nessun invio reale.
const os = require('os');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.SQLITE_PATH = path.join(os.tmpdir(), `taverna-test-${process.pid}-${Date.now()}.db`);
process.env.JWT_SECRET = 'test-secret';
process.env.PHONE_HASH_SECRET = 'test-phone-hash-secret';
process.env.DISABLE_SCHEDULER = '1';
delete process.env.TWILIO_ACCOUNT_SID;
delete process.env.TWILIO_AUTH_TOKEN;

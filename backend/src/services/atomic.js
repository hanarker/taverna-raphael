const { Transaction } = require('sequelize');
const sequelize = require('../config/db');

const MAX_BUSY_RETRIES = 3;
const isSqlite = () => sequelize.getDialect() === 'sqlite';

function isBusyError(error) {
    return error?.parent?.code === 'SQLITE_BUSY' || error?.original?.code === 'SQLITE_BUSY';
}

// Su SQLite le transazioni di scrittura sono accodate in-process (un solo processo backend):
// niente contesa sul lock del file. BEGIN IMMEDIATE resta come difesa se altri processi
// (script, seed) scrivono sullo stesso DB. Su PostgreSQL la serializzazione è data dal lock di riga.
let sqliteWriteQueue = Promise.resolve();

async function runTransaction(work) {
    const options = isSqlite() ? { type: Transaction.TYPES.IMMEDIATE } : {};
    for (let attempt = 1; ; attempt += 1) {
        try {
            return await sequelize.transaction(options, work);
        } catch (error) {
            if (!isBusyError(error) || attempt >= MAX_BUSY_RETRIES) throw error;
        }
    }
}

function runAtomic(work) {
    if (!isSqlite()) return runTransaction(work);
    const run = sqliteWriteQueue.then(() => runTransaction(work));
    sqliteWriteQueue = run.catch(() => undefined);
    return run;
}


module.exports = { runAtomic, isSqlite };

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const useSqlite = process.env.NODE_ENV === 'development'
    || process.env.NODE_ENV === 'test'
    || process.env.DB_DIALECT === 'sqlite';

const sqlitePath = process.env.SQLITE_PATH || path.join(__dirname, '../../dev.db');

const SQLITE_BUSY_TIMEOUT_MS = 5000;

const sequelize = useSqlite
    ? new Sequelize({
        dialect: 'sqlite',
        storage: sqlitePath,
        logging: false,
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            logging: false,
        }
    );

if (useSqlite) {
    // Ogni connessione: attesa sui lock (scritture concorrenti serializzate), WAL per non
    // bloccare i lettori, secure_delete perché l'hard delete GDPR non lasci dati nelle pagine libere.
    sequelize.addHook('afterConnect', (connection) => new Promise((resolve, reject) => {
        connection.exec(
            `PRAGMA busy_timeout=${SQLITE_BUSY_TIMEOUT_MS}; PRAGMA journal_mode=WAL; PRAGMA secure_delete=ON; PRAGMA foreign_keys=ON;`,
            (err) => (err ? reject(err) : resolve())
        );
    }));
}

module.exports = sequelize;

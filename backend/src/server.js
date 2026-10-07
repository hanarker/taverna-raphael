const app = require('./app');
const sequelize = require('./config/db');
const { runMigrations } = require('./config/migrate');
const { startScheduler } = require('./jobs/scheduler');

const PORT = process.env.PORT || 3001;

async function startServer() {
    if (!process.env.PHONE_HASH_SECRET) {
        console.error('PHONE_HASH_SECRET non configurato: impostalo nel .env (vedi .env.example).');
        process.exit(1);
    }
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Schema gestito da migrazioni (niente sync alter: su SQLite ricreerebbe le tabelle).
        await runMigrations();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        startScheduler();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

startServer();

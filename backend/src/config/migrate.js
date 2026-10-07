const path = require('path');
const { Umzug, SequelizeStorage } = require('umzug');
const sequelize = require('./db');

function createMigrator() {
    return new Umzug({
        migrations: { glob: path.join(__dirname, '../../migrations/*.js') },
        context: sequelize,
        storage: new SequelizeStorage({ sequelize }),
        logger: console,
    });
}

async function runMigrations() {
    return createMigrator().up();
}

module.exports = { runMigrations };

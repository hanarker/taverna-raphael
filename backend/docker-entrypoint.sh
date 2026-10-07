#!/bin/bash
set -e

SQLITE_PATH="${SQLITE_PATH:-/data/dev.db}"

echo "Checking database at ${SQLITE_PATH}..."

# Verifica se il DB è vuoto (tabella AdminUsers inesistente o vuota)
DB_EMPTY=$(node - <<'EOF'
const { Sequelize } = require('sequelize');
const path = process.env.SQLITE_PATH || '/data/dev.db';
const seq = new Sequelize({ dialect: 'sqlite', storage: path, logging: false });
seq.authenticate()
  .then(() => seq.query("SELECT count(*) as cnt FROM AdminUsers", { type: Sequelize.QueryTypes.SELECT }))
  .then(([row]) => {
    const count = row.cnt || row['count(*)'] || 0;
    console.log(parseInt(count) === 0 ? 'empty' : 'has_data');
    process.exit(0);
  })
  .catch(() => {
    console.log('empty');
    process.exit(0);
  });
EOF
)

if [ "$DB_EMPTY" = "empty" ]; then
  echo "Database is empty — running seed..."
  node scripts/seed.js
  echo "Seed completed."
else
  echo "Database already has data — skipping seed."
fi

exec node src/server.js

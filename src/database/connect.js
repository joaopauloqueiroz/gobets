const { Client } = require('pg');

const client = new Client({
    user: 'cielolink',
    host: 'cielolink.postgresql.dbaas.com.br',
    database: 'cielolink',
    password: '',
    port: 5432,
    ssl: { rejectUnauthorized: false }
})
client.connect();

module.exports = client
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
require('dotenv').config(); // Load .env if present

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'unipilot',
    password: process.env.DB_PASSWORD || 'password123',
    port: parseInt(process.env.DB_PORT) || 5433,
});

async function run() {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected. Reading init_db.sql...');
        const sqlPath = path.join(__dirname, '../database/init_db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(`Executing SQL script (${sql.length} bytes)...`);
        await client.query(sql);
        console.log('Schema initialized successfully.');
    } catch (err) {
        console.error('Error initializing schema:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();

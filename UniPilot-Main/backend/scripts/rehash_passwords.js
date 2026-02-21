/**
 * Rehash all user passwords from bcrypt to Argon2id + pepper
 * Uses the known default password "password" for all users.
 *
 * Usage: node scripts/rehash_passwords.js
 */
import path from "path";
import dotenv from "dotenv";
const __dirname = import.meta.dirname;
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { hashPassword } from "../src/utils/bcrypt.js";

import pg from "pg";

const DEFAULT_PASSWORD = "password";

async function main() {
    const client = new pg.Client({
        connectionString:
            process.env.DATABASE_URL ||
            `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
        ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    console.log("Connected to database");

    // Get count of users
    const { rows: countRows } = await client.query("SELECT COUNT(*) as total FROM users");
    const total = parseInt(countRows[0].total, 10);
    console.log(`Found ${total} users. Rehashing all with Argon2id + pepper...`);

    // Hash the default password once (all users get the same hash)
    const newHash = await hashPassword(DEFAULT_PASSWORD);
    console.log(`New Argon2id hash generated (sample): ${newHash.substring(0, 40)}...`);

    // Update all users in a single query
    const result = await client.query("UPDATE users SET password_hash = $1", [newHash]);
    console.log(`✓ Updated ${result.rowCount} users with Argon2id hashed password`);

    await client.end();
    console.log("Done! All users now have password: \"password\" hashed with Argon2id + pepper.");
    process.exit(0);
}

main().catch((e) => {
    console.error("Error:", e);
    process.exit(1);
});

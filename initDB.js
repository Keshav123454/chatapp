import { pool } from "./db.js";

const initDb = async () => {
    try {
        // Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20)
            )
        `);

        // Tokens table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                refresh_token VARCHAR(255) UNIQUE NOT NULL,
                CONSTRAINT fk_user
                    FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        `);

        // Index for faster user_id lookups
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_tokens_user_id
            ON tokens(user_id)
        `);

        console.log("Database tables created successfully");
    } catch (error) {
        console.error("Error creating tables:", error);
    } finally {
        await pool.end();
    }
};

initDb();
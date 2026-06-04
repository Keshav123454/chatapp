import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});



// const pool = require("./db");

async function main() {
    try {
        const result = await pool.query("SELECT NOW()");

        console.log("Connected successfully!");
        console.log(result.rows);
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

main();
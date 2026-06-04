import { pool } from "./db.js";

export const createUser = async ({ name, email, password, phone }) => {
    const query = `
        INSERT INTO users (name, email, password, phone)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, phone
    `;

    const values = [name, email, password, phone];

    const result = await pool.query(query, values);

    return result.rows[0];
};

export const fetchUserFromDb = async (email, password) => {
    const query = `
        SELECT * FROM users
        WHERE email = $1 AND password = $2
    `;

    const values = [email, password];

    const result = await pool.query(query, values);

    return result.rows[0];
};

export const saveRefreshToken = async (userId, refreshToken) => {
    const query = `
        INSERT INTO tokens (user_id, refresh_token)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE
        SET refresh_token = EXCLUDED.refresh_token
    `;
    
    const values = [userId, refreshToken];
    const result = await pool.query(query, values);
    return result.rowCount > 0;
};

export const getRefreshToken = async (refreshToken) => {
    const query = `
        SELECT * FROM tokens
        WHERE refresh_token = $1
    `;

    const values = [refreshToken];
    const result = await pool.query(query, values);
    return result.rows[0];
}
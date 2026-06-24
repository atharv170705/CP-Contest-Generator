import { pool } from "../config/index.js";

const createUserDb = async ({handle, rating}) => {
    const query = `
        INSERT INTO users(handle, rating)
        VALUES($1, $2)
        RETURNING *;
    `;
    const {rows} = await pool.query(query, [handle, rating]);
    return rows[0];
}

const getUserByHandleDb = async (handle) => {
    const query = `
        SELECT * 
        FROM users
        WHERE users.handle = $1;
    `;
    const {rows} = await pool.query(query, [handle]);
    return rows[0];
}

export {createUserDb, getUserByHandleDb}
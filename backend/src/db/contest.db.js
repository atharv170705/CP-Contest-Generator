import { pool } from "../config/index.js";

const createContestDb = async ({user_id, duration}) => {
    const query = `
        INSERT INTO contests(user_id, duration)
        VALUES($1, $2)
        RETURNING *;
    `;
    const {rows} = await pool.query(query, [user_id, duration]);
    return rows[0];
}

const getContestByIdDb = async (contestId) => {
    const query = `
        SELECT *
        FROM contests
        WHERE contests.id = $1;
    `;
    const {rows} = await pool.query(query, [contestId]);
    return rows[0];
}

export {createContestDb, getContestByIdDb};
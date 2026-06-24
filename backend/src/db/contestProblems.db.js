import { pool } from "../config/index.js";

const createContestProblemsDb = async (problems) => {
    const {contest_id, contest_id_cf, problem_index, problem_name, rating} = problems;
    const query = `
        INSERT INTO contest_problems(contest_id, contest_id_cf, problem_index, problem_name, rating)
        VALUES($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const {rows} = await pool.query(query, [contest_id, contest_id_cf, problem_index, problem_name, rating]);
    return rows[0];
}

const getContestProblemsDb = async (contestId) => {
    const query = `
        SELECT *
        FROM contest_problems
        WHERE contest_problems.contest_id = $1;
    `;

    const {rows} = await pool.query(query, [contestId]);
    
    return rows;
}

export {createContestProblemsDb, getContestProblemsDb};
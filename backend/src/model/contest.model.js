import { createContestDb, endContestDb, getContestByIdDb } from "../db/contest.db.js";

const createContest = async (contest) => {
    try {
        return await createContestDb(contest);
    } catch (error) {
        throw new Error("Error creating contest");
    }
}   

const getContestById = async (contestId) => {
    try {
        return await getContestByIdDb(contestId);
    } catch (error) {
        throw new Error("Error getting contest");
    }
}

const endContestById = async (contestId) => {
    try {
        return await endContestDb(contestId);
    } catch (error) {
        throw new Error("Error ending contest");
    }
}

export {createContest, getContestById, endContestById};
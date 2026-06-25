import { createUserDb, getUserByHandleDb, getUserByIdDb } from "../db/user.db.js";

const createUser = async (user) => {
    try {
        return await createUserDb(user);
    } catch (error) {
        throw new Error("Error creating user");
    }
}

const getUserByHandle = async (handle) => {
    try {
        return await getUserByHandleDb(handle)
    } catch (error) {
        throw new Error("Error getting user");
    }
}

const getUserById = async (id) => {
    try {
        return await getUserByIdDb(id);
    } catch (error) {
        throw new Error("Error getting user");
    }
}

export {createUser, getUserByHandle, getUserById};
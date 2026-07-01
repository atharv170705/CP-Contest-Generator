import { createGoogleUserDb, getUserByEmailDb, updateHandleDb } from "../db/new.user.db.js";

const createGoogleUser = async (user) => {
    try {
        return await createGoogleUserDb(user);
    } catch (error) {
        throw new Error("Error creating user");
    }
}

const getUserByEmail = async (email) => {
    try {
        return await getUserByEmailDb(email)
    } catch (error) {
        throw new Error("Error getting user");
    }
}

const updateHandle = async (user) => {
    try {
        return await updateHandleDb(user)
    } catch (error) {
        throw new Error("Error updating user");
    }
}


export {createGoogleUser, getUserByEmail, updateHandle};
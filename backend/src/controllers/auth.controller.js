import { oauth2Client } from "../config/google.js";
import { google } from "googleapis";
import { createGoogleUser, getUserByEmail } from "../model/new_user.model.js";
import jwt from 'jsonwebtoken';

const googleLogin = (req, res) => {

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "openid",
            "profile",
            "email"
        ]
    });

    return res.redirect(url);
};

const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        const { tokens } = await oauth2Client.getToken(code);

        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: "v2",
        });

        const { data } = await oauth2.userinfo.get();

        let user = await getUserByEmail(data.email);

        if (!user) {
            user = await createGoogleUser({
                email: data.email,
                name: data.name,
                picture: data.picture,
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        const options = {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };

        res.cookie("token", token, options);

        if (user.handle) {
            return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        }
        return res.redirect(`${process.env.FRONTEND_URL}/setup`);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Google Login Failed"
        });
    }
};

const getMe = async (req, res) => {
    return res.json(req.user);
}

export { googleLogin, googleCallback, getMe };
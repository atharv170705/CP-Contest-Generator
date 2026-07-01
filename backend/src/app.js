import express from 'express'
import cors from 'cors'
import axios from 'axios'
import {pool} from './config/index.js';
import cookieParser from 'cookie-parser';
const app = express();


app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.json({
        message: 'All good'
    });
});

app.get('/test-db', async (req, res) => {
    const result = await pool.query("SELECT NOW()");
    return res.status(200).json({rows: result.rows});
})

import cfRouter from './routes/cfRoutes.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';

app.use('/', cfRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);

export default app;
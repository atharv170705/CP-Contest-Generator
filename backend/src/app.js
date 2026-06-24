import express from 'express'
import cors from 'cors'
import axios from 'axios'
import {pool} from './config/index.js';
const app = express();


app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

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
app.use('/', cfRouter);

export default app;
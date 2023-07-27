import express, { Request, Response } from 'express';
import config from './config';
import mongoose from 'mongoose';
import rootRouter from './route';

const app = express();

// router
app.use('/', rootRouter);

export default app;

import express, { Request, Response } from 'express';
import config from './config';
import mongoose from 'mongoose';
import rootRouter from './routes';
import routeNotFound from './middleware/routeNotFound';
import errorHandlerMiddleware from './middleware/handlerError';

const app = express();
app.use(express.json());

// router
app.use('/api/v1', rootRouter);

// middleware
app.use(routeNotFound);
app.use(errorHandlerMiddleware);

export default app;

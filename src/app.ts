import express, { Request, Response } from 'express';
import rootRouter from './routes';
import routeNotFound from './middleware/routeNotFound';
import errorHandlerMiddleware from './middleware/handlerError';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());

// router
app.use('/api/v2', rootRouter);

// middleware
app.use(routeNotFound);
app.use(errorHandlerMiddleware);

export default app;

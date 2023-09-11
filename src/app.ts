import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import rootRouter from './routes';
import routeNotFound from './middleware/routeNotFound';
import errorHandlerMiddleware from './middleware/handlerError';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// router
app.use('/api/v2', rootRouter);

// middleware
app.use(routeNotFound);
app.use(errorHandlerMiddleware);

export default app;

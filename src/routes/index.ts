import express, { Router, Request, Response } from 'express';
import locationRouter from './location';
import restoRouter from './resto';

const rootRouter = Router();

// this route is divided by common/user categories on api spec
rootRouter.use('/resto', restoRouter);
rootRouter.use('/', () => {});
rootRouter.use('/location', locationRouter);

export default rootRouter;
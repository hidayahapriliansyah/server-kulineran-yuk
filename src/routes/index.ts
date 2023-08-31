import express, { Router, Request, Response } from 'express';
import locationRouter from '../api/v2/location/route';
import restoRouter from '../api/v2/resto/route';

const rootRouter = Router();

rootRouter.use('/location', locationRouter);
rootRouter.use('/resto', restoRouter);
// rootRouter.use('/', );

export default rootRouter;

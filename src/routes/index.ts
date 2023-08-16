import express, { Router, Request, Response } from 'express';
import locationRouter from '../api/v1/location/route';
import restoRouter from '../api/v1/resto/route';
import customerRouter from '../api/v1/customer/route';

const rootRouter = Router();

rootRouter.use('/location', locationRouter);
rootRouter.use('/resto', restoRouter);
rootRouter.use('/', customerRouter);

export default rootRouter;

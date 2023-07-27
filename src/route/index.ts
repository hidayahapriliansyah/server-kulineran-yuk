import express, { Router, Request, Response } from 'express';
import customerRouter from '../api/v1/customer/router';
import locationRouter from '../api/v1/location/router';
import restoRouter from '../api/v1/resto/router';

const rootRouter = Router();

// this route is divided by common/user categories on api spec
rootRouter.use('/', customerRouter);
rootRouter.use('/resto', restoRouter);
rootRouter.use('/location', locationRouter);

export default rootRouter;
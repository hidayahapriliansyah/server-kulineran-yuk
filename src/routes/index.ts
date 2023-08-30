import express, { Router, Request, Response } from 'express';
import locationRouter from '../api/v2/location/route';

const rootRouter = Router();

rootRouter.use('/location', locationRouter);
// rootRouter.use('/resto', );
// rootRouter.use('/', );

export default rootRouter;

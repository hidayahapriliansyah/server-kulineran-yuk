import express, { Router, Request, Response } from 'express';
import restoAuthRouter from './auth/route';

const restoRouter = Router();

restoRouter.use('/', restoAuthRouter);

export default restoRouter;
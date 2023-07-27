import express, { Router, Request, Response } from 'express';
import { index } from './controller';

const locDisctricRouter = Router();

locDisctricRouter.get('/', index);

export default locDisctricRouter;
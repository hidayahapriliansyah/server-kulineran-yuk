import express, { Router, Request, Response } from 'express';
import { index } from './controller';

const locRegencyRouter = Router();

locRegencyRouter.get('/', index);

export default locRegencyRouter;
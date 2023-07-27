import express, { Router, Request, Response } from 'express';
import { index } from './controller';

const locVillageRouter = Router();

locVillageRouter.get('/', index);

export default locVillageRouter;
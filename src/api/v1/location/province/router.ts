import express, { Router, Request, Response } from 'express';
import { index } from './controller';

const locProvinceRouter = Router();

locProvinceRouter.get('/', index);

export default locProvinceRouter;
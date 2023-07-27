import express, { Router, Request, Response } from 'express';
import locProvinceRouter from './province/router';
import locRegencyRouter from './regency/router';
import locDisctricRouter from './district/router';
import locVillageRouter from './village/router';

const locationRouter = Router();

locationRouter.use('/province', locProvinceRouter);
locationRouter.use('/regency', locRegencyRouter);
locationRouter.use('/district', locDisctricRouter);
locationRouter.use('/village', locVillageRouter);

locationRouter.get('/', (req: Request, res: Response) => {
  res.send('Location router');
});

export default locationRouter;

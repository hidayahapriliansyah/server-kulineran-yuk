import { Router } from 'express';
import locationDistrictRouter from './district/route';
import locationProvinceRouter from './province/route';
import locationVillageRouter from './village/route';
import locationRegencyRouter from './regency/route';

// route: /api/v2/location
const locationRouter = Router();

locationRouter.use('/province', locationProvinceRouter);
locationRouter.use('/regency', locationRegencyRouter);
locationRouter.use('/district', locationDistrictRouter);
locationRouter.use('/village', locationVillageRouter);

export default locationRouter;
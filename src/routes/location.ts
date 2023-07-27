import express, { Router, Request, Response } from 'express';
import { getProvinceController } from '../controllers/location/province';
import { getRegencyController } from '../controllers/location/regency';
import { getDistrictController } from '../controllers/location/district';
import { getVillageController } from '../controllers/location/village';

const locationRouter = Router();

// province
locationRouter.get('/province', getProvinceController);
// regency
locationRouter.get('/regency', getRegencyController);
// district
locationRouter.get('/district', getDistrictController);
// village
locationRouter.get('/village', getVillageController);

export default locationRouter;

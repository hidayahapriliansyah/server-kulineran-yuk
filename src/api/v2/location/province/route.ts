import { Router } from 'express';
import { getProvinceController } from './controller';

// route: /api/v1/location/province
const locationProvinceRouter = Router();

locationProvinceRouter.get('/', getProvinceController);

export default locationProvinceRouter;
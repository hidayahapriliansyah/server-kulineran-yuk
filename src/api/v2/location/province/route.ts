import { Router } from 'express';
import * as provinceContoller from './controller';

// route: /api/v1/location/province
const locationProvinceRouter = Router();

locationProvinceRouter.get('/', provinceContoller.getProvinceController);

export default locationProvinceRouter;
import { Router } from 'express';
import * as districtController from './controller';

// route: /api/v1/location/district
const locationDistrictRouter = Router();

locationDistrictRouter.get('/', districtController.getDistrictController);

export default locationDistrictRouter;
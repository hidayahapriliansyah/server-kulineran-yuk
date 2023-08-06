import { Router } from 'express';
import { getDistrictController } from './controller';

// route: /api/v1/location/district
const locationDistrictRouter = Router();

locationDistrictRouter.get('/', getDistrictController);

export default locationDistrictRouter;
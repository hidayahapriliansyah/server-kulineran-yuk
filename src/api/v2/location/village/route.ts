import { Router } from 'express';
import { getVillageController } from './controller';

// route: /api/v1/location/village
const locationVillageRouter = Router();

locationVillageRouter.get('/', getVillageController);

export default locationVillageRouter;
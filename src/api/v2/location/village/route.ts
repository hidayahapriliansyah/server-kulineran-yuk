import { Router } from 'express';
import * as villageController from './controller';

// route: /api/v1/location/village
const locationVillageRouter = Router();

locationVillageRouter.get('/', villageController.getVillageController);

export default locationVillageRouter;
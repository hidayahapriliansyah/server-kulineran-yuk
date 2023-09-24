import { Router } from 'express';

import * as locationController from './controller';

// route: /api/v1/location/regency
const locationRegencyRouter = Router();

locationRegencyRouter.get('/', locationController.getRegency);

export default locationRegencyRouter;
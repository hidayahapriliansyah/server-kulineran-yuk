import { Router } from 'express';
import { getRegencyController } from './controller';

// route: /api/v1/location/regency
const locationRegencyRouter = Router();

locationRegencyRouter.get('/', getRegencyController);

export default locationRegencyRouter;
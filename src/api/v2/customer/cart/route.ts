import { Router } from 'express';

import * as cartController from './controller';

// route: /api/v2/cart
const customerCartRouter = Router();

customerCartRouter.get('/', cartController.getOverviewCartGrouped);

export default customerCartRouter;
import { Router } from 'express';

import * as customerRefreshTokenController from './controller';

// route: /api/v2/resto/refresh-token
const customerRefreshTokenRouter = Router();

customerRefreshTokenRouter.get(
  '/:refreshTokenValidator/:token',
  customerRefreshTokenController.validateRefreshToken
);

export default customerRefreshTokenRouter;

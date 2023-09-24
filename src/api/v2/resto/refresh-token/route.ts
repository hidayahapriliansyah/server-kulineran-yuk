import { Router } from 'express';

import * as restoRefreshTokenController from './controller';

// route: /api/v2/resto/refresh-token
const restoRefreshTokenRouter = Router();

restoRefreshTokenRouter.get('/:refreshTokenValidator/:token', restoRefreshTokenController.validateRefreshToken);

export default restoRefreshTokenRouter;

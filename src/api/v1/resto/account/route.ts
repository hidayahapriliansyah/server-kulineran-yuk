import { Router } from 'express';
import {
  checkingEmailVerificationController,
  createReEmailVerificationRequestController,
  createResetPasswordRequestController
} from './controller';

const restoAccountRouter = Router();

// route: /api/v1/resto/account
restoAccountRouter.post('/verification', createReEmailVerificationRequestController);
restoAccountRouter.get('/verification/:uniqueString', checkingEmailVerificationController);
restoAccountRouter.post('/reset/request', createResetPasswordRequestController);
restoAccountRouter.get('/reset/:uniqueString', () => {});

export default restoAccountRouter;

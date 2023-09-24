import { Router } from 'express';

import * as accountController from './controller';

const restoAccountRouter = Router();

// route: /api/v2/resto/account
restoAccountRouter.post('/verification', accountController.createReEmailVerificationRequest);
restoAccountRouter.get('/verification/:uniqueString', accountController.checkingEmailVerification);
restoAccountRouter.post('/reset/request', accountController.createResetPasswordRequest);
restoAccountRouter.get('/reset/:uniqueString', accountController.checkingResetPassword);
restoAccountRouter.post('/reset/confirmation', accountController.createNewPasswordViaResetPassword);

export default restoAccountRouter;

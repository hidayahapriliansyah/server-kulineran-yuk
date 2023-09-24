import { Router } from 'express'

import * as customerAccountController from './controller';

// route: /api/v2/account/
const customerAccountRouter = Router();

customerAccountRouter.post('/verification', customerAccountController.createReEmailVerificationRequest);
customerAccountRouter.get('/verification/:uniqueString', customerAccountController.checkingEmailVerification);
customerAccountRouter.post('/reset/request', customerAccountController.createResetPasswordRequest);
customerAccountRouter.get('/reset/:uniqueString', customerAccountController.checkingResetPassword);
customerAccountRouter.post('/reset/confirmation', customerAccountController.createNewPasswordViaResetPassword);

export default customerAccountRouter;

import { Router } from 'express';
import { authenticationCustomerAccount } from '../../../../middleware/auth';
import { isEmailCustomerVerified } from '../../../../middleware/emailVerification';

import * as profileController from './controller'; 

const customerProfileRouter = Router();

customerProfileRouter.use(authenticationCustomerAccount, isEmailCustomerVerified);

customerProfileRouter.get('/', profileController.getCustomerProfile);
customerProfileRouter.put('/', profileController.updateCustomerProfile);
customerProfileRouter.put('/joinbotram', profileController.updateCustomerJoinBotramMethod);

export default customerProfileRouter;

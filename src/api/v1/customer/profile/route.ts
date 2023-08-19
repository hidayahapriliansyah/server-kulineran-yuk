import { Router } from 'express';
import { authenticationCustomerAccount } from '../../../../middleware/auth';
import { isEmailCustomerVerified } from '../../../../middleware/emailVerification';

import * as customerController from './controller'; 

const customerProfileRouter = Router();

customerProfileRouter.use(authenticationCustomerAccount, isEmailCustomerVerified);

customerProfileRouter.get('/', customerController.getCustomerProfile);
customerProfileRouter.put('/', customerController.updateCustomerProfile);
customerProfileRouter.put('/joinbotram', customerController.updateCustomerJoinBotramMethod);

export default customerProfileRouter;

import { Router } from 'express';

import { authenticationCustomerAccount } from '../../../../middleware/auth';
import { isEmailCustomerVerified } from '../../../../middleware/emailVerification';
import * as customerPurchaseController from './controller';

// route: /api/v2/purchase
const customerPurchaseRouter = Router();

customerPurchaseRouter.use(authenticationCustomerAccount, isEmailCustomerVerified);

customerPurchaseRouter.get('/', customerPurchaseController.getPurchase);

export default customerPurchaseRouter;

import { Router } from 'express';

import * as customerOrderController from './controller';
import { authenticationCustomerAccount } from '../../../../middleware/auth';
import { isEmailCustomerVerified } from '../../../../middleware/emailVerification';

// route: /api/v2/orders
const customerOrdersRouter = Router();

customerOrdersRouter.use(authenticationCustomerAccount, isEmailCustomerVerified);

customerOrdersRouter.post('/', customerOrderController.createOrder);
customerOrdersRouter.get('/', customerOrderController.getOrderList);
customerOrdersRouter.get('/:orderId', customerOrderController.getOrderById);
customerOrdersRouter.delete('/:orderId', customerOrderController.deleteUnprocessedOrder);

export default customerOrdersRouter;

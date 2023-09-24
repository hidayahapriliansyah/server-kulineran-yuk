import { Router } from 'express';
import { authenticationCustomerAccount } from '../../../../middleware/auth';
import { isEmailCustomerVerified } from '../../../../middleware/emailVerification';
import * as customMenuController from './controller';

// route: /api/v2/custom-menu
const customerCustomMenuRouter = Router();

customerCustomMenuRouter.use(authenticationCustomerAccount, isEmailCustomerVerified);

customerCustomMenuRouter.get('/', customMenuController.getAllCustomMenu);
customerCustomMenuRouter.post('/', customMenuController.createCustomMenu);
customerCustomMenuRouter.get('/:customMenuId', customMenuController.getCustomMenuById);
customerCustomMenuRouter.put('/:customMenuId', customMenuController.updateCustomMenu);
customerCustomMenuRouter.delete('/:customMenuId', customMenuController.deleteCustomMenu);

export default customerCustomMenuRouter;

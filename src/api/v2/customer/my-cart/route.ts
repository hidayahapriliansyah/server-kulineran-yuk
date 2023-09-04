import { Router } from 'express';

import * as customerMyCartController from './controller';
import { authenticationCustomerAccount } from '../../../../middleware/auth';
import { isEmailCustomerVerified } from '../../../../middleware/emailVerification';

// route: /api/v2/my-cart
const customerMyCartRouter = Router();

// middleware
customerMyCartRouter.use(authenticationCustomerAccount, isEmailCustomerVerified);

customerMyCartRouter.get('/', customerMyCartController.getMyCart);
customerMyCartRouter.post('/item', customerMyCartController.addMenuToMyCart);
customerMyCartRouter.get('/detail/:restaurantId', customerMyCartController.getItemsByRestaurant);
customerMyCartRouter.put('/item/:myCartId/quantity', customerMyCartController.updateQtyOfMyCartItem);
customerMyCartRouter.delete('/item/:myCartId', customerMyCartController.deleteMyCartItem);
customerMyCartRouter.delete('/bulk', customerMyCartController.itemBulkDeletion);

export default customerMyCartRouter;

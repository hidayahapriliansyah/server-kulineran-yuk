import { Router } from 'express';
import { authenticationCustomerAccount } from '../../../../middleware/auth';
import { isEmailCustomerVerified } from '../../../../middleware/emailVerification';
import * as wishlistController from './controller';

// route: /api/v1/wishlist
const customerWishlistRouter = Router();

customerWishlistRouter.use(authenticationCustomerAccount, isEmailCustomerVerified);

customerWishlistRouter.get('/', wishlistController.getAllWishlist);
customerWishlistRouter.post('/:menuId', wishlistController.addMenuWishlist);
customerWishlistRouter.get('/:menuId', wishlistController.isMenuInWishlist);
customerWishlistRouter.delete('/:menuId', wishlistController.removeMenuFromWishlist);

export default customerWishlistRouter;

import { Router } from 'express';
import customerAuthRouter from './auth/route';
import customerProfileRouter from './profile/route';
import customerRestaurantRouter from './restaurant/route';
import customerWishlistRouter from './wishlist/route';
import customerCustomMenuRouter from './custom-menu/route';
import customerInvitationRouter from './invitations/route';
import customerBotramRouter from './botram/route';
import customerCartRouter from './cart/route';
import customerMyCartRouter from './my-cart/route';
import customerBotramCartRouter from './botram-cart/route';
import customerOrdersRouter from './orders/route';
import customerPurchaseRouter from './purchase/route';
import customerAccountRouter from './account/route';
import customerNotificationsRoute from './notifications/route';
import customerRefreshTokenRouter from './refresh-token/route';

// route: /api/v2/
const customerRouter = Router();

customerRouter.use('/auth', customerAuthRouter);
customerRouter.use('/profile', customerProfileRouter);
customerRouter.use('/restaurant', customerRestaurantRouter);
customerRouter.use('/wishlist', customerWishlistRouter);
customerRouter.use('/custom-menu', customerCustomMenuRouter);
customerRouter.use('/invitations', customerInvitationRouter);
customerRouter.use('/botram', customerBotramRouter);
customerRouter.use('/cart', customerCartRouter);
customerRouter.use('/my-cart', customerMyCartRouter);
customerRouter.use('/botram-cart', customerBotramCartRouter);
customerRouter.use('/orders', customerOrdersRouter);
customerRouter.use('/purchase', customerPurchaseRouter);
customerRouter.use('/account', customerAccountRouter);
customerRouter.use('/notifications', customerNotificationsRoute);
customerRouter.use('/refresh-token', customerRefreshTokenRouter);

export default customerRouter;

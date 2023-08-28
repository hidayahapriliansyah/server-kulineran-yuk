import { Router } from 'express';
import customerAuthRouter from './auth/route';
import customerProfileRouter from './profile/route';
import customerRestaurantRouter from './restaurant/route';
import customerWishlistRouter from './wishlist/route';
import customerCustomMenuRouter from './custom-menu/route';
import customerInvitationRouter from './invitations/route';
import customerBotramRouter from './botram/route';

// route: /api/v1/
const customerRouter = Router();

customerRouter.use('/auth', customerAuthRouter);
customerRouter.use('/profile', customerProfileRouter);
customerRouter.use('/restaurant', customerRestaurantRouter);
customerRouter.use('/wishlist', customerWishlistRouter);
customerRouter.use('/custom-menu', customerCustomMenuRouter);
customerRouter.use('/invitations', customerInvitationRouter);
customerRouter.use('/botram', customerBotramRouter);

export default customerRouter;

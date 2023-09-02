import { Router } from 'express';
import customerAuthRouter from './auth/route';
import customerProfileRouter from './profile/route';
import customerRestaurantRouter from './restaurant/route';
import customerWishlistRouter from './wishlist/route';
import customerCustomMenuRouter from './custom-menu/route';
import customerInvitationRouter from './invitations/route';

// route: /api/v2/
const customerRouter = Router();

customerRouter.use('/auth', customerAuthRouter);
customerRouter.use('/profile', customerProfileRouter);
customerRouter.use('/restaurant', customerRestaurantRouter);
customerRouter.use('/wishlist', customerWishlistRouter);
customerRouter.use('/custom-menu', customerCustomMenuRouter);
customerRouter.use('/invitations', customerInvitationRouter);
customerRouter.use('/botram', () => {});

export default customerRouter;

import { Router } from 'express';
import customerAuthRouter from './auth/route';
import customerProfileRouter from './profile/route';
import customerRestaurantRouter from './restaurant/route';

// route: /api/v2/
const customerRouter = Router();

customerRouter.use('/auth', customerAuthRouter);
customerRouter.use('/profile', customerProfileRouter);
customerRouter.use('/restaurant', customerRestaurantRouter);
customerRouter.use('/wishlist', () => {});
customerRouter.use('/custom-menu', () => {});
customerRouter.use('/invitations', () => {});
customerRouter.use('/botram', () => {});

export default customerRouter;

import { Router } from 'express';
import customerAuthRouter from './auth/route';

// route: /api/v2/
const customerRouter = Router();

customerRouter.use('/auth', customerAuthRouter);
customerRouter.use('/profile', () => {});
customerRouter.use('/restaurant', () => {});
customerRouter.use('/wishlist', () => {});
customerRouter.use('/custom-menu', () => {});
customerRouter.use('/invitations', () => {});
customerRouter.use('/botram', () => {});

export default customerRouter;

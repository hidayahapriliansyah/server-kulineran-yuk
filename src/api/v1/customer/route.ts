import { Router } from 'express';
import customerAuthRouter from './auth/route';
import customerProfileRouter from './profile/route';

// route: /api/v1/
const customerRouter = Router();

customerRouter.use('/auth', customerAuthRouter);
customerRouter.use('/profile', customerProfileRouter);

export default customerRouter;

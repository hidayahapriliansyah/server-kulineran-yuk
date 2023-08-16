import { Router } from 'express';
import customerAuthRouter from './auth/route';

// route: /api/v1/
const customerRouter = Router();

customerRouter.use('/auth', customerAuthRouter);

export default customerRouter;

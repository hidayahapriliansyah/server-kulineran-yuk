import { Router } from 'express';
import restoAuthRouter from './auth/route';
import restoProfileRouter from './profile/route';
import restoAccountRouter from './account/route';

// route: /api/v1/resto/
const restoRouter = Router();

restoRouter.use('/auth', restoAuthRouter);
restoRouter.use('/profile', restoProfileRouter);
restoRouter.use('/account', restoAccountRouter);

export default restoRouter;
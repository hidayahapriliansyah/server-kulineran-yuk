import { Router } from 'express';
import restoAuthRouter from './auth/route';
import restoProfileRouter from './profile/route';

// route: /api/v1/resto/
const restoRouter = Router();

restoRouter.use('/auth', restoAuthRouter);
restoRouter.use('/profile', restoProfileRouter);

export default restoRouter;
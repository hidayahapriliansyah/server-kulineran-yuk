import { Router } from 'express';
import restoAuthRouter from './auth/route';
import restoProfileRouter from './profile/route';

// route: /api/v2/resto
const restoRouter = Router();

restoRouter.use('/auth', restoAuthRouter);
restoRouter.use('/profile', restoProfileRouter);
restoRouter.use('/account', () => {});
restoRouter.use('/menus', () => {});
restoRouter.use('/custom-menu', () => {});
restoRouter.use('/notifications', () => {});

export default restoRouter;
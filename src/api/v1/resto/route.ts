import { Router } from 'express';
import restoAuthRouter from './auth/route';
import restoProfileRouter from './profile/route';
import restoAccountRouter from './account/route';
import restoMenusRouter from './menu/route';
import restoCustomMenuRouter from './custom-menu/route';
import restoNotificationsRouter from './notifications/route';

// route: /api/v1/resto/
const restoRouter = Router();

restoRouter.use('/auth', restoAuthRouter);
restoRouter.use('/profile', restoProfileRouter);
restoRouter.use('/account', restoAccountRouter);
restoRouter.use('/menus', restoMenusRouter);
restoRouter.use('/custom-menu', restoCustomMenuRouter);
restoRouter.use('/notifications', restoNotificationsRouter);

export default restoRouter;
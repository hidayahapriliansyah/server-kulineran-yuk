import { Router } from 'express';
import restoAuthRouter from './auth/route';
import restoProfileRouter from './profile/route';
import restoMenusRouter from './menus/route';
import restoCustomMenuRouter from './custom-menu/route';
import restoNotificationsRouter from './notifications/route';

// route: /api/v2/resto
const restoRouter = Router();

restoRouter.use('/auth', restoAuthRouter);
restoRouter.use('/profile', restoProfileRouter);
restoRouter.use('/account', restoAuthRouter);
restoRouter.use('/menus', restoMenusRouter);
restoRouter.use('/custom-menu', restoCustomMenuRouter);
restoRouter.use('/notifications', restoNotificationsRouter);

export default restoRouter;
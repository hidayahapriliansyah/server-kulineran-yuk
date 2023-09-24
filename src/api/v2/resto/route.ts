import { Router } from 'express';
import restoAuthRouter from './auth/route';
import restoProfileRouter from './profile/route';
import restoMenusRouter from './menus/route';
import restoCustomMenuRouter from './custom-menu/route';
import restoNotificationsRouter from './notifications/route';
import restoOrdersRouter from './orders/route';
import restoReviewsRouter from './reviews/route';
import restoRefreshTokenRouter from './refresh-token/route';
import restoAccountRouter from './account/route';

// route: /api/v2/resto
const restoRouter = Router();

restoRouter.use('/auth', restoAuthRouter);
restoRouter.use('/profile', restoProfileRouter);
restoRouter.use('/account', restoAccountRouter);
restoRouter.use('/menus', restoMenusRouter);
restoRouter.use('/custom-menu', restoCustomMenuRouter);
restoRouter.use('/notifications', restoNotificationsRouter);
restoRouter.use('/orders', restoOrdersRouter);
restoRouter.use('/reviews', restoReviewsRouter);
restoRouter.use('/refresh-token', restoRefreshTokenRouter);

export default restoRouter;
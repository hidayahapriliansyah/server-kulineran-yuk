import { Router } from 'express';
import * as notificationController from './controller';

// route: /api/v2/resto/notifications
const restoNotificationsRouter = Router();

restoNotificationsRouter.get('/', notificationController.getAllNotifications);
restoNotificationsRouter.put('/all', notificationController.updateAllRestaurantNotificationReadStatus);
restoNotificationsRouter.put('/:notificationId', notificationController.updateRestaurantNotificationReadStatus);
restoNotificationsRouter.get('/count', notificationController.getTotalUnreadRestaurantNotifications);

export default restoNotificationsRouter;

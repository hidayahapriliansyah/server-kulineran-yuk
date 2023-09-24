import { Router } from 'express';

import { authenticationCustomerAccount } from '../../../../middleware/auth';
import { isEmailCustomerVerified } from '../../../../middleware/emailVerification';
import * as customerNotificationController from './controller';

// route: /api/v2/notifications
const customerNotificationsRoute = Router();

customerNotificationsRoute.use(authenticationCustomerAccount, isEmailCustomerVerified);

customerNotificationsRoute.get('/', customerNotificationController.getAllNotifications);
customerNotificationsRoute.put('/all', customerNotificationController.updateAllCustomerNotificationReadStatus);
customerNotificationsRoute.put('/:notificationId', customerNotificationController.updateCustomerNotificationReadStatus);
customerNotificationsRoute.get('/count', customerNotificationController.getTotalUnreadCustomerNotifications);

export default customerNotificationsRoute;

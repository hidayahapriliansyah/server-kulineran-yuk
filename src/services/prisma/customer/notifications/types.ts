import { CustomerNotification } from '@prisma/client';

type CustomerNotificationResponse = 
  Pick<CustomerNotification, 'id' | 'title' | 'description' | 'isRead' | 'createdAt'>;

type GetAllNotificationsResponse = {
  notifications: CustomerNotificationResponse[] | [],
  pages: number,
  total: number,
};

export {
  CustomerNotificationResponse,
  GetAllNotificationsResponse,
};

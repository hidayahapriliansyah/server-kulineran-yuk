import { RestaurantNotification } from '@prisma/client';

type RestaurantNotificationResponse = 
  Pick<RestaurantNotification, 'id' | 'title' | 'description' | 'isRead' | 'createdAt'>;
type GetNotificationsWithPaginated = {
  notifications: RestaurantNotificationResponse[],
  pages: number,
  total: number,
};

export {
  RestaurantNotificationResponse,
  GetNotificationsWithPaginated,
};

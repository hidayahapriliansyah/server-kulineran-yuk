import { IRestaurantNotification } from '../../../../models/RestaurantNotification';

type RestaurantNotificationResponse = 
  Pick<IRestaurantNotification, '_id' | 'title' | 'description' | 'isRead' | 'createdAt'>;
type GetNotificationsWithPaginated = {
  notifications: RestaurantNotificationResponse[],
  pages: number,
  total: number,
};

export {
  RestaurantNotificationResponse,
  GetNotificationsWithPaginated,
};
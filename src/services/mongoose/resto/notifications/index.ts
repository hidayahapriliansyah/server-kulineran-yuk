import { Request } from 'express';
import { IRestaurant } from '../../../../models/Restaurant';
import { BadRequest, NotFound } from '../../../../errors';
import RestaurantNotification from '../../../../models/RestaurantNotification';

import * as DTO from './types';

const getAllNotifications = async (req: Request):
  Promise<DTO.GetNotificationsWithPaginated | Error> => {
    const { _id: restaurantId } = req.user as Pick<IRestaurant, '_id' | 'email'>;
    try {
      const { limit = '10', page = '1', read }: {
        limit?: string,
        page?: string
        read?: string,
      } = req.query;

      const numberedLimit = parseInt(limit);
      const numberedPage = parseInt(page);
      if (isNaN(numberedLimit) || isNaN(numberedPage)) {
        throw new BadRequest('Invalid Request. Please check your input data.');
      }
      
      let filter = {};
      if (read) {
        if(!['0', '1'].includes(read)) {
          throw new BadRequest('Invalid Request. Please check your input data.');
        }

        filter = {
          ...filter,
          isRead: Boolean(Number(read)),
        };
      }

      const notifications =
        await RestaurantNotification.find({ restaurantId, ...filter })
          .limit(numberedLimit)
          .skip(numberedLimit * (numberedPage - 1));

      const notificationsCount = await RestaurantNotification.countDocuments({ restaurantId, ...filter });
      const totalPages = Math.ceil(notificationsCount / numberedLimit);
      if (numberedPage !== 1 && numberedPage > totalPages) {
        throw new BadRequest('Input page is bigger than total pages. Please check your page query.');
      }

      const result: DTO.GetNotificationsWithPaginated = {
        notifications: notifications.map((notif) => ({
          _id: notif._id,
          title: notif.title,
          description: notif.description,
          isRead: notif.isRead,
          createdAt: notif.createdAt,
        })),
        pages: totalPages,
        total: notificationsCount,
      };
      return result;
    } catch (error: any) {
      throw error;
    }
  };

const updateRestaurantNotificationReadStatus = async (req: Request):
  Promise<DTO.RestaurantNotificationResponse['_id'] | Error> => {
    const { _id: restaurantId } = req.user as Pick<IRestaurant, '_id' | 'email'>;
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        throw new BadRequest('Invalid Request. notificationId params is undefined. Please check your input data.');
      }

      const updatedNotification = 
        await RestaurantNotification.findOneAndUpdate({ _id: notificationId, restaurantId }, { isRead: true });

      if (!updatedNotification) {
        throw new NotFound('Notification Id is not found. Please input valid notification id.');
      }
      
      const { _id: result} = updatedNotification;
      return result;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Notification Id is not found. Please input valid notification id.');
      }
      throw error;
    }
  };

const updateAllRestaurantNotificationReadStatus = async (req: Request): Promise<void | Error> => {
  const { _id: restaurantId } = req.user as Pick<IRestaurant, '_id' | 'email'>;
  try {
    await RestaurantNotification.updateMany({ restaurantId, isRead: false }, { isRead: true });
  } catch (error: any) {
    throw error;
  }
};

const getTotalUnreadRestaurantNotifications = async (req: Request): Promise<number | Error> => {
  const { _id: restaurantId } = req.user as Pick<IRestaurant, '_id' | 'email'>;
  try {
    const countUnreadNotifications =
      await RestaurantNotification.countDocuments({ restaurantId, isRead: false });
    
    const result = countUnreadNotifications;
    return result;
  } catch (error: any) {
    throw error;
  }
};

export {
  getAllNotifications,
  updateRestaurantNotificationReadStatus,
  updateAllRestaurantNotificationReadStatus,
  getTotalUnreadRestaurantNotifications,
};

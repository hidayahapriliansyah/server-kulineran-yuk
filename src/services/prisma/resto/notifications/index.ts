import { Request } from 'express';

import * as DTO from './types';
import { Restaurant } from '@prisma/client';
import { BadRequest, NotFound } from '../../../../errors';
import prisma from '../../../../db';

const getAllNotifications = async (req: Request):
  Promise<DTO.GetNotificationsWithPaginated | Error> => {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
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
        await prisma.restaurantNotification.findMany({
          where: {
            restaurantId,
            ...filter,
          },
          skip: numberedLimit * (numberedPage - 1),
          take: numberedLimit,
        });

      const notificationsCount = await prisma.restaurantNotification.count({
          where: {
            restaurantId,
            ...filter,
          }
        });
      const totalPages = Math.ceil(notificationsCount / numberedLimit);
      if (numberedPage !== 1 && numberedPage > totalPages) {
        throw new BadRequest('Input page is bigger than total pages. Please check your page query.');
      }

      const result: DTO.GetNotificationsWithPaginated = {
        notifications: notifications.map((notif) => ({
          id: notif.id,
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

const updateAllRestaurantNotificationReadStatus = async (req: Request): Promise<void | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  try {
    await prisma.restaurantNotification.updateMany({
      where: {
        restaurantId,
        isRead: false,
      },
      data: {
        isRead: true,
      }
    });
  } catch (error: any) {
    throw error;
  }
};

const updateRestaurantNotificationReadStatus = async (req: Request):
  Promise<DTO.RestaurantNotificationResponse['id'] | Error> => {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        throw new BadRequest('Invalid Request. notificationId params is undefined. Please check your input data.');
      }

      const updatedNotification =
        await prisma.restaurantNotification.update({
          where: {
            restaurantId,
            id: notificationId,
          },
          data: {
            isRead: true,
          }
        });

      if (!updatedNotification) {
        throw new NotFound('Notification Id is not found. Please input valid notification id.');
      }
      
      const result = updatedNotification.id;
      return result;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Notification Id is not found. Please input valid notification id.');
      }
      throw error;
    }
  };

const getTotalUnreadRestaurantNotifications = async (req: Request): Promise<number | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  try {
    const countUnreadNotifications = await prisma.restaurantNotification.count({
      where: {
        restaurantId,
        isRead: false,
      }
    });

    const result = countUnreadNotifications;
    return result;
  } catch (error: any) {
    throw error;
  }
};

export {
  getAllNotifications,
  updateAllRestaurantNotificationReadStatus,
  updateRestaurantNotificationReadStatus,
  getTotalUnreadRestaurantNotifications,
};

import { Request } from 'express';

import * as DTO from './types';
import { Restaurant } from '@prisma/client';
import { BadRequest, NotFound } from '../../../../errors';
import prisma from '../../../../db';

const getAllNotifications = async (
  req: Request
): Promise<DTO.GetNotificationsWithPaginated | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;

  const { limit = '10', page = '1', read }: {
    limit?: string,
    page?: string,
    read?: string,
  } = req.query;

  const numberedLimit = parseInt(limit);
  const numberedPage = parseInt(page);
  if (isNaN(numberedLimit) || isNaN(numberedPage)) {
    throw new BadRequest('limit or page query is not number.');
  }
  
  let filter = {};
  if (read) {
    if(!['0', '1'].includes(read)) {
      throw new BadRequest('read is not 0 or 1.');
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
    throw new BadRequest('Input page is bigger than total pages.');
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
};

const updateAllRestaurantNotificationReadStatus = async (
  req: Request
): Promise<void | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  await prisma.restaurantNotification.updateMany({
    where: { restaurantId, isRead: false },
    data: { isRead: true },
  });
};

const updateRestaurantNotificationReadStatus = async (
  req: Request
): Promise<DTO.RestaurantNotificationResponse['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  const { notificationId } = req.params;

  if (!notificationId) {
    throw new BadRequest('notificationId param is missing.');
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
    throw new NotFound('Notification is not found.');
  }
  
  const result = updatedNotification.id;
  return result;
};

const getTotalUnreadRestaurantNotifications = async (
  req: Request
): Promise<number | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;

  const countUnreadNotifications = await prisma.restaurantNotification.count({
    where: {
      restaurantId,
      isRead: false,
    }
  });

  const result = countUnreadNotifications;
  return result;
};

export {
  getAllNotifications,
  updateAllRestaurantNotificationReadStatus,
  updateRestaurantNotificationReadStatus,
  getTotalUnreadRestaurantNotifications,
};

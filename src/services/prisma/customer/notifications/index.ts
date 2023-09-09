import { Request } from 'express';

import prisma from '../../../../db';
import { Customer, CustomerNotification, Prisma } from '@prisma/client';
import { BadRequest, NotFound } from '../../../../errors';
import * as DTO from './types';

const getAllNotifications = async (
  req: Request
):Promise<DTO.GetAllNotificationsResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { limit = '10', page = '1', read }: {
    limit?: string,
    page?: string
    read?: string,
  } = req.query;

  const numberedLimit = Number(limit);
  const numberedPage = Number(page);
  if (isNaN(numberedLimit) || isNaN(numberedPage)) {
    throw new BadRequest('Invalid Request. Please check your input data.');
  }
  
  let filter: Prisma.CustomerNotificationWhereInput = {};
  if (read) {
    if(!['0', '1'].includes(read)) {
      throw new BadRequest('Invalid Request. Please check your input data.');
    }

    filter = { ...filter, isRead: Boolean(Number(read)) };
  }

  const notifications = await prisma.customerNotification.findMany({
    where: { customerId, ...filter, },
    skip: numberedLimit * (numberedPage - 1),
    take: numberedLimit,
  });

  const notificationsCount = await prisma.customerNotification.count({
    where: { customerId, ...filter },
  });
  const totalPages = Math.ceil(notificationsCount / numberedLimit);
  if (numberedPage !== 1 && numberedPage > totalPages) {
    throw new BadRequest('Input page is bigger than total pages. Please check your page query.');
  }

  const result: DTO.GetAllNotificationsResponse = {
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

const updateAllCustomerNotificationReadStatus = async (req: Request): Promise<void | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  await prisma.customerNotification.updateMany({
    where: { customerId, isRead: false },
    data: { isRead: true },
  });
};

const updateCustomerNotificationReadStatus = async (
  req: Request
):Promise<CustomerNotification['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { notificationId } = req.params;
  if (!notificationId) {
    throw new BadRequest('Invalid Request. notificationId params is undefined. Please check your input data.');
  }

  const updatedNotification = await prisma.customerNotification.update({
    where: { id: notificationId, customerId },
    data: { isRead: true },
  });

  if (!updatedNotification) {
    throw new NotFound('Notification Id is not found. Please input valid notification id.');
  }

  return updatedNotification.id;
};

const getTotalUnreadCustomerNotifications = async (
  req: Request
): Promise<number | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const countUnreadNotifications = await prisma.customerNotification.count({
    where: { customerId, isRead: false },
  });

  return countUnreadNotifications;
};

export {
  getAllNotifications,
  updateAllCustomerNotificationReadStatus,
  updateCustomerNotificationReadStatus,
  getTotalUnreadCustomerNotifications,
};

import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import * as notificationService from '../../../../services/prisma/resto/notifications';
import * as DTO from '../../../../services/prisma/resto/notifications/types';
import { SuccessAPIResponse } from '../../../../global/types';

const getAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await notificationService.getAllNotifications(req) as DTO.GetNotificationsWithPaginated;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to get notification data.', result))
  } catch (error: any) {
    next(error);
  }
};

const updateAllRestaurantNotificationReadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await notificationService
        .updateAllRestaurantNotificationReadStatus(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating all notification read status successfully.'));
  } catch (error: any) {
    next(error);
  }
};

const updateRestaurantNotificationReadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await notificationService
        .updateRestaurantNotificationReadStatus(req) as DTO.RestaurantNotificationResponse['id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating notification status successfully.', {
        notificationId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getTotalUnreadRestaurantNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await notificationService.getTotalUnreadRestaurantNotifications(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to get the number of unread notification data.', {
        unreadNotification: result
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getAllNotifications,
  updateAllRestaurantNotificationReadStatus,
  updateRestaurantNotificationReadStatus,
  getTotalUnreadRestaurantNotifications,
};

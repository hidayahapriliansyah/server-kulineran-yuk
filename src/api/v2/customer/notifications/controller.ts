import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as notificationService from '../../../../services/prisma/customer/notifications';

const getAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await notificationService.getAllNotifications(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to get notification data.', result))
  } catch (error: any) {
    next(error);
  }
};

const updateAllCustomerNotificationReadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await notificationService.updateAllCustomerNotificationReadStatus(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating all notification read status successfully.'));
  } catch (error: any) {
    next(error);
  }
};

const updateCustomerNotificationReadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await notificationService.updateCustomerNotificationReadStatus(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating notification status successfully.', {
        notificationId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getTotalUnreadCustomerNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await notificationService.getTotalUnreadCustomerNotifications(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to get the number of unread notification data.', {
        unreadNotification: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getAllNotifications,
  updateAllCustomerNotificationReadStatus,
  updateCustomerNotificationReadStatus,
  getTotalUnreadCustomerNotifications,
};

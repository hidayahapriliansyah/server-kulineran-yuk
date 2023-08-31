import { Request, Response, NextFunction } from 'express';

import { PayloadDataAccessToken } from '../utils/createJwtPayloadData';
import { Unauthenticated } from '../errors';
import prisma from '../db';

const minimumSetupAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: restaurantId } = req.user as PayloadDataAccessToken;

  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }});
    if (!restaurant) {
      throw new Unauthenticated('Access denied. Please authenticate to access this resource.');
    }
    if (restaurant!.passMinimumProfileSetting) {
      throw new Unauthenticated('Your account has not completed the minimum profile setup. Please complete your profile before using the application features.');
    }
    next();
  } catch (error) {
    next(error);
  }
};

export {
  minimumSetupAccount,
};

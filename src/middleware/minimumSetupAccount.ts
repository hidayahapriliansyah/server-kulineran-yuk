import { Request, Response, NextFunction } from 'express';
import { IPayloadDataAccessToken } from '../utils/createJwtPayloadData';
import Restaurant from '../models/Restaurant';
import { Unauthenticated } from '../errors';

const minimumSetupAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { _id: restaurantId } = req.user as IPayloadDataAccessToken;

  try {
    const restaurant = await Restaurant.findById(restaurantId);
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
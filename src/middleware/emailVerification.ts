import { Request, Response, NextFunction } from 'express';
import { IPayloadDataAccessToken } from '../utils/createJwtPayloadData';
import Restaurant from '../models/Restaurant';
import { Unauthenticated } from '../errors';
import Customer from '../models/Customer';

const isEmailRestoVerified = async (
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
    if (restaurant!.isVerified) {
      res.locals.isEmailVerified = false;
    }
  } catch (error) {
    next(error);
  }
};

const isEmailCustomerVerified = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { _id: customerId } = req.user as IPayloadDataAccessToken;

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Unauthenticated('Access denied. Please authenticate to access this resource.');
    }
    if (customer!.isVerified) {
      res.locals.isEmailVerified = false;
    }
  } catch (error) {
    next(error);
  }
};

export {
  isEmailCustomerVerified,
  isEmailRestoVerified,
};

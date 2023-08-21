import { Request, Response, NextFunction } from 'express';
import { IPayloadDataAccessToken } from '../utils/createJwtPayloadData';
import Restaurant from '../models/Restaurant';
import { Unauthenticated, Unauthorized } from '../errors';
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
    
    if (!restaurant!.isVerified) {
      throw new Unauthorized('Access denied. Please verify your email.');
    }

    next();
  } catch (error: any) {
    if (error.name === 'CastError') {
      error = new Unauthenticated('Access denied. Please authenticate to access this resource.');
    }
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
    if (!customer!.isVerified) {
      throw new Unauthorized('Access denied. Please verify your email.');
    }
    next();
  } catch (error) {
    next(error);
  }
};

export {
  isEmailCustomerVerified,
  isEmailRestoVerified,
};

import { Request, Response, NextFunction } from 'express';
import { PayloadDataAccessToken } from '../utils/createJwtPayloadData';
import { Unauthenticated, Unauthorized } from '../errors';
import prisma from '../db';

const isEmailRestoVerified = async (
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
  const { id: customerId } = req.user as PayloadDataAccessToken;

  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId }});
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

import { Request, Response, NextFunction } from 'express';
import config from '../config';
import { Unauthenticated } from '../errors';
import { IPayloadDataAccessToken } from '../utils/createJwtPayloadData';
import { isAccessTokenValid } from '../utils';

const authenticationAdminRestoAccount = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cookieName = config.restoAccessTokenCookieName;
    if (!req.cookies) {
      throw new Unauthenticated('Access denied. Please authenticate to access this resource.');
    }
    const token = req.cookies[cookieName];
    if (!token) {
      throw new Unauthenticated('Access denied. Please authenticate to access this resource.');
    }
    const payload = isAccessTokenValid({ token, userType: 'resto' }) as IPayloadDataAccessToken;

    console.log('authenticationAdminRestoAccount payload =>>>', payload);
    req.user = {
      _id: payload._id,
      email: payload.email,
    } as IPayloadDataAccessToken;
    next();
  } catch (error: any) {
    next(error);
  }
};

const authenticationCustomerAccount = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cookieName = config.customerAccessTokenCookieName;
    if (!req.cookies) {
      throw new Unauthenticated('Access denied. Please authenticate to access this resource.');
    }
    const token = req.cookies[cookieName];
    if (!token) {
      throw new Unauthenticated('Access denied. Please authenticate to access this resource.');
    }
    const payload = isAccessTokenValid({ token, userType: 'customer' }) as IPayloadDataAccessToken;
    
    req.user = {
      _id: payload._id,
      email: payload.email,
    } as IPayloadDataAccessToken;
    next();
  } catch (error: any) {
    next(error);
  }
};

export {
  authenticationAdminRestoAccount,
  authenticationCustomerAccount,
};
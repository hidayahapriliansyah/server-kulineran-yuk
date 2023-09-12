import { Request, Response, NextFunction } from 'express';
import config from '../config';
import { Unauthenticated } from '../errors';
import { PayloadDataAccessToken } from '../utils/createJwtPayloadData';
import { isAccessTokenValid } from '../utils';
import { TokenExpiredError } from 'jsonwebtoken';

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
    const payload = isAccessTokenValid({ token, userType: 'resto' }) as PayloadDataAccessToken;

    req.user = {
      id: payload.id,
      email: payload.email,
    } as PayloadDataAccessToken;
    next();
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      error.message = 'jwt expired |RESTO';
    }
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
    const payload = isAccessTokenValid({ token, userType: 'customer' }) as PayloadDataAccessToken;
    
    req.user = {
      id: payload.id,
      email: payload.email,
    } as PayloadDataAccessToken;
    next();
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      error.message = 'jwt expired |CUSTOMER';
    }
    next(error);
  }
};

export {
  authenticationAdminRestoAccount,
  authenticationCustomerAccount,
};
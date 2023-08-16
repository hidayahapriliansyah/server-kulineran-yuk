import { Response } from 'express';
import {
  createJWTPayloadDataCustomerAccessToken,
  createJWTPayloadDataRestoAccessToken
} from './createJwtPayloadData';
import { createAccessToken } from './jwt';
import config from '../config';
import { IRestaurant } from '../models/Restaurant';
import { ICustomer } from '../models/Customer';

const createCookieRestoAccessToken = (res: Response, dataForPayload: IRestaurant): void => {
  const payload = createJWTPayloadDataRestoAccessToken(dataForPayload);
  const token = createAccessToken({ payload, userType: 'resto' });
  const cookieName = config.restoAccessTokenCookieName;
  const maxAge = 24 * 60 * 60 * 1000;
  res.cookie(cookieName, token, { maxAge });
};

const createCookieCustomerAccessToken = (res: Response, dataForPayload: ICustomer): void => {
  const payload = createJWTPayloadDataCustomerAccessToken(dataForPayload);
  const token = createAccessToken({ payload, userType: 'customer' });
  const cookieName = config.customerAccessTokenCookieName;
  const maxAge = 24 * 60 * 60 * 1000;
  res.cookie(cookieName, token, { maxAge });
};

export {
  createCookieRestoAccessToken,
  createCookieCustomerAccessToken,
};

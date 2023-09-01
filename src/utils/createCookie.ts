import { Response } from 'express';
import {
  createJWTPayloadDataCustomerAccessToken,
  createJWTPayloadDataCustomerIDToken,
  createJWTPayloadDataRestoAccessToken,
  createJWTPayloadDataRestoIDToken
} from './createJwtPayloadData';
import { createAccessToken, createIDToken } from './jwt';
import config from '../config';
import { Restaurant, Customer } from '@prisma/client';

const createCookieRestoAccessToken = (res: Response, dataForPayload: Restaurant): void => {
  const payload = createJWTPayloadDataRestoAccessToken(dataForPayload);
  const token = createAccessToken({ payload, userType: 'resto' });
  const cookieName = config.restoAccessTokenCookieName;
  const maxAge = 24 * 60 * 60 * 1000;
  res.cookie(cookieName, token, { maxAge });
};

const createCookieRestoIDToken = (res: Response, dataForPayload: Restaurant): void => {
  const payload = createJWTPayloadDataRestoIDToken(dataForPayload);
  const token = createIDToken({ payload, userType: 'resto' });
  const cookieName = config.restoIDTokenCookieName;
  const maxAge = 24 * 60 * 60 * 1000;
  res.cookie(cookieName, token, { maxAge });
};

const createCookieCustomerAccessToken = (res: Response, dataForPayload: Customer): void => {
  const payload = createJWTPayloadDataCustomerAccessToken(dataForPayload);
  const token = createAccessToken({ payload, userType: 'customer' });
  const cookieName = config.customerAccessTokenCookieName;
  const maxAge = 24 * 60 * 60 * 1000;
  res.cookie(cookieName, token, { maxAge });
};

const createCookieCustomerIDToken = (res: Response, dataForPayload: Customer): void => {
  const payload = createJWTPayloadDataCustomerIDToken(dataForPayload);
  const token = createIDToken({ payload, userType: 'resto' });
  const cookieName = config.customerIDTokenCookieName;
  const maxAge = 24 * 60 * 60 * 1000;
  res.cookie(cookieName, token, { maxAge });
};

export {
  createCookieRestoAccessToken,
  createCookieCustomerAccessToken,
  createCookieRestoIDToken,
  createCookieCustomerIDToken,
};

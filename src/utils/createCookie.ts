import { Response } from 'express';
import { createJWTPayloadDataRestoAccessToken } from './createJwtPayloadData';
import { createAccessToken } from './jwt';
import config from '../config';
import { IRestaurant } from '../models/Restaurant';

const createCookieRestoAccessToken = (res: Response, dataForPayload: IRestaurant): void => {
  const payload = createJWTPayloadDataRestoAccessToken(dataForPayload);
  const token = createAccessToken({ payload, userType: 'resto' });
  const cookieName = config.restoAccessTokenCookieName;
  const maxAge = 24 * 60 * 60 * 1000;
  res.cookie(cookieName, token, { maxAge });
};

export {
  createCookieRestoAccessToken,
};

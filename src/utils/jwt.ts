import jwt from 'jsonwebtoken';
import config from '../config';
import { PayloadDataAccessToken, PayloadDataIDToken, PayloadDataRefreshToken } from './createJwtPayloadData';
import { Unauthenticated } from '../errors';

const createAccessToken = ({
  payload,
  userType,
}: {
  payload: PayloadDataAccessToken;
  userType: 'resto' | 'customer';
}): string => {
  const jwtSecret = userType === 'resto'
    ? config.restoJWTSecretAccessToken
    : config.customerJWTSecretAccessToken;

  const token = jwt.sign(
    payload,
    jwtSecret,
    { expiresIn: config.jwtExpiration },
  );
  return token;
};

const createRefreshToken = ({
  payload,
  userType,
}: {
  payload: PayloadDataRefreshToken;
  userType: 'resto' | 'customer';
}): string => {
  const jwtSecret = userType === 'resto'
    ? config.restoJWTSecretRefreshToken
    : config.customerJWTSecretRefreshToken;

  const token = jwt.sign(
    payload,
    jwtSecret,
    { expiresIn: config.jwtRefreshTokenExpiration },
  );
  return token;
};

const createIDToken = ({
  payload,
  userType,
}: {
  payload: PayloadDataIDToken;
  userType: 'resto' | 'customer';
}): string => {
  const jwtSecret =
  userType === 'resto'
    ? config.restoJWTSecretIDToken
    : config.customerJWTSecretIDToken;

  const token = jwt.sign(
    payload,
    jwtSecret,
    { expiresIn: config.jwtExpiration },
  );
  return token;
};

const isAccessTokenValid = ({
  token,
  userType,
}: {
  token: string;
  userType: 'resto' | 'customer';
}) => {
  const jwtSecret =
    userType === 'resto'
      ? config.restoJWTSecretAccessToken
      : config.customerJWTSecretAccessToken;

  try {
    return jwt.verify(token, jwtSecret);
  } catch (error: any) {
    throw error;
  }
};

const isRefreshTokenValid = ({
  token,
  userType,
}: {
  token: string;
  userType: 'resto' | 'customer';
}) => {
  const jwtSecret =
    userType === 'resto'
      ? config.restoJWTSecretRefreshToken
      : config.customerJWTSecretRefreshToken;

  try {
    return jwt.verify(token, jwtSecret);
  } catch (error: any) {
    throw error;
  }
};

const isIDTokenValid = ({
  token,
  userType,
}: {
  token: string;
  userType: 'resto' | 'customer';
}) => {
  const jwtSecret =
    userType === 'resto'
      ? config.restoJWTSecretIDToken
      : config.customerJWTSecretIDToken;

  try {
    return jwt.verify(token, jwtSecret);
  } catch (error: any) {
    throw new Unauthenticated('Access denied. Please authenticate to access this resource.');
  }
};

export {
  createAccessToken,
  createIDToken,
  isAccessTokenValid,
  isIDTokenValid,
  createRefreshToken,
  isRefreshTokenValid,
};

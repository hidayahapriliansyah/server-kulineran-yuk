import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import { Customer } from '@prisma/client';
import { createCookieCustomerAccessToken } from '../../../../utils/createCookie';
import { createIDToken, createJWTPayloadDataCustomerIDToken } from '../../../../utils';
import * as refreshTokenService from '../../../../services/prisma/customer/refresh-token';

const validateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await refreshTokenService.validateRefreshToken(req) as Customer;
    createCookieCustomerAccessToken(res, result);

    const customerIdToken = createIDToken({
      payload: createJWTPayloadDataCustomerIDToken(result),
      userType: 'customer',
    });

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Refresh token is valid', {
        userId: customerIdToken,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  validateRefreshToken,
};

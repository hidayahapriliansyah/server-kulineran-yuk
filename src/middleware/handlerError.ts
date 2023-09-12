import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ValidationErrorAPIResponse } from '../global/types';
import CustomAPIError from '../errors/CustomAPIError';
import ValidationError from '../errors/ValidationError';
import { Unauthenticated } from '../errors';
import prisma from '../db';
import { Customer, CustomerRefreshTokenValidation, Restaurant, RestaurantRefreshTokenValidation } from '@prisma/client';

const errorHandlerMiddleware = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError: { statusCode: StatusCodes; message: string; errors?: { message: string; field: string; }[] } =
    {
      statusCode:
        err instanceof CustomAPIError
          ? err.statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR,
      message: err.message,
    };

  if (err instanceof TokenExpiredError) {
    type UserType = 'RESTO' | 'CUSTOMER' | 'REFRESH_TOKEN';
    const userType = err.message.split('|')[1] as UserType;

    if (userType === 'REFRESH_TOKEN') {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(new Unauthenticated('Token is expired.'));
    }

    let refreshTokenValidatorId: RestaurantRefreshTokenValidation['id'] | CustomerRefreshTokenValidation['id'];
    if (userType === 'RESTO') {
      const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
      const refreshTokenValidator = await prisma.restaurantRefreshTokenValidation.create({
        data: { restaurantId },
      });
      refreshTokenValidatorId = refreshTokenValidator.id;
    } else {
      const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
      const refreshTokenValidator = await prisma.customerRefreshTokenValidation.create({
        data: { customerId },
      });
      refreshTokenValidatorId = refreshTokenValidator.id;
    }

    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({
        success: false,
        message: 'Token expired',
        data: {
          token: refreshTokenValidatorId,
        },
      });
  }

  if (err instanceof JsonWebTokenError) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(new Unauthenticated('Token is invalid'));
  }

  if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
    const errors = {
      message: `${(err.meta?.target as string[])[0]} is exist. Please use another.`,
      field: (err.meta?.target as string[])[0],
    };

    customError = new ValidationError(
      'Validation errors in your request.',
      errors,
    );

    return res
      .status(customError.statusCode)
      .json(
        new ValidationErrorAPIResponse(customError.message, customError.errors!)
      );
  }

  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => ({
      message: e.message,
      field: e.path[0],
    }));

    customError = new ValidationError(
      'Validation errors in your request.',
      errors
    );

    return res
      .status(customError.statusCode)
      .json(
        new ValidationErrorAPIResponse(customError.message, customError.errors!)
      );
  }
};

export default errorHandlerMiddleware;

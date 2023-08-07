import { Request, Response, NextFunction } from 'express';
import CustomAPIError from '../errors/CustomAPIError';
import { StatusCodes } from 'http-status-codes';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

import { ZodError, custom } from 'zod';
import ValidationError from '../errors/ValidationError';
import { ValidationErrorAPIResponse } from '../global/types';

const errorHandlerMiddleware = (
  err: Error | MongooseError | CustomAPIError | MongoError,
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

    // TODO 
    // if err.name === TokenExpiredError
    // if err.name === JsonWebTokenError

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

  // return res.status(customError.statusCode).json({
  //   message: customError.message,
  //   errors: customError?.errors,
  // });

  // if (err instanceof MongoError ) {
  //   if (err.code && err.code === 11000) {
  //     customError.message = `${Object.keys(err.)}`
  //   }
  // }

  // if (err instanceof MongooseError.ValidationError) {

  // }

  // if (err instanceof MongooseError.CastError) {}
};

export default errorHandlerMiddleware;

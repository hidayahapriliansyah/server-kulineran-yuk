import { Request, Response, NextFunction } from 'express';
import CustomAPIError from '../errors/CustomAPIError';
import { StatusCodes } from 'http-status-codes';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

import { ZodError, custom } from 'zod';
import ValidationError from '../errors/ValidationError';

const errorHandlerMiddleware = (
  err: Error | MongooseError | CustomAPIError | MongoError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError: { statusCode: StatusCodes, message: string, errors?: {}[] } = {
    statusCode: err instanceof CustomAPIError ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR, 
    message: err.message,
  }

  if (err instanceof ZodError) {
    const errors = err.issues.map((e) => ({
      message: e.message,
      field: e.path[0],
    }));
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = 'Validation errors in your request.';
    customError.errors = errors;
  }

  // return res.status(customError.statusCode).json({
  //   message: customError.message,
  //   errors: customError?.errors,
  // });

  return res.status(customError.statusCode).json(new ValidationError(
    customError.message,
    customError.errors,
  ));

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

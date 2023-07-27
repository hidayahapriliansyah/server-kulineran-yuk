import { Request, Response, NextFunction } from 'express';
import CustomAPIError from '../errors/CustomAPIError';
import { StatusCodes } from 'http-status-codes';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

const errorHandlerMiddleware = (
  err: Error | MongooseError | CustomAPIError | MongoError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // let customError: { statusCode: StatusCodes, message: string } = {
  //   statusCode: err instanceof CustomAPIError ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR, 
  //   message: err.message,
  // }

  // if (err instanceof MongoError ) {
  //   if (err.code && err.code === 11000) {
  //     customError.message = `${Object.keys(err.)}`
  //   }
  // }

  // if (err instanceof MongooseError.ValidationError) {
    
  // }

  // if (err instanceof MongooseError.CastError) {}
};

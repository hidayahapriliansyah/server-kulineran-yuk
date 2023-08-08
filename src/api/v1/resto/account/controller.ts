import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../../../../global/types';
import { createReEmailVerificationRequest } from '../../../../services/mongoose/resto/account';

const createReEmailVerificationRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await createReEmailVerificationRequest(req);
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success sending email verification request to system.'));
  } catch (error: any) {
    next(error);
  }
};

export {
  createReEmailVerificationRequestController,
};
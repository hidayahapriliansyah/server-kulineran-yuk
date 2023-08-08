import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../../../../global/types';
import {
  checkingEmailVerification,
  checkingResetPassword,
  createReEmailVerificationRequest,
  createResetPasswordRequest
} from '../../../../services/mongoose/resto/account';

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

const checkingEmailVerificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkingEmailVerification(req);
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Email verification is valid. This account is now verified.'));
  } catch (error: any) {
    next(error);
  }
};

const createResetPasswordRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await createResetPasswordRequest(req);
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success sending reset password request to system'));
  } catch (error: any) {
    next(error);
  }
};

const checkingResetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await checkingResetPassword(req);
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Request password is valid. Please continue to create the new password.'));
  } catch (error: any) {
    next(error);
  }
};

export {
  createReEmailVerificationRequestController,
  checkingEmailVerificationController,
  createResetPasswordRequestController,
};
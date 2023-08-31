import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import * as accountService from '../../../../services/prisma/resto/account';
import { SuccessAPIResponse } from '../../../../global/types';

const createReEmailVerificationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await accountService.createReEmailVerificationRequest(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success sending email verification request to system.'));
  } catch (error: any) {
    next(error);
  }
};

const checkingEmailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await accountService.checkingEmailVerification(req);
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Email verification is valid. This account is now verified.'));
  } catch (error: any) {
    next(error);
  }
};

const createResetPasswordRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await accountService.createResetPasswordRequest(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success sending reset password request to system'));
  } catch (error: any) {
    next(error);
  }
};

const checkingResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await accountService.checkingResetPassword(req);
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Request password is valid. Please continue to create the new password.'));
  } catch (error: any) {
    next(error);
  }
};

const createNewPasswordViaResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await accountService.createNewPasswordViaResetPassword(req);
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('New password saved successfully. Please continue to sign in.'));
  } catch (error: any) {
    next(error);
  }
};

export {
  createReEmailVerificationRequest,
  checkingEmailVerification,
  createResetPasswordRequest,
  checkingResetPassword,
  createNewPasswordViaResetPassword,
};

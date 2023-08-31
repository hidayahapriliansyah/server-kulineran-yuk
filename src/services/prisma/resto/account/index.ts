import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

import * as DTO from './types';
import prisma from '../../../../db';
import createRestaurantEmailVerification from '../../../../utils/createRestaurantEmailVerification';
import { BadRequest, NotFound } from '../../../../errors';
import Conflict from '../../../../errors/Conflict';
import dayjs from 'dayjs';
import InvalidToken from '../../../../errors/InvalidToken';

const createReEmailVerificationRequest = async (req: Request): Promise<void | Error> => {
  try {
    const body: DTO.ReEmailVerificationRequestBody =
      DTO.reEmailVerificationRequestBody.parse(req.body);

    const accountWithEmailIsNotVerifiedExist = await prisma.restaurant.findUnique({
      where: {
        email: body.email,
        isVerified: false,
      },
    });

    if (accountWithEmailIsNotVerifiedExist) {
      const { id, email } = accountWithEmailIsNotVerifiedExist;
      await createRestaurantEmailVerification({ restaurantId: id, restaurantEmail: email });
    }
  } catch (error: any) {
    throw error;
  }
};

const checkingEmailVerification = async (req: Request): Promise<void | Error> => {
  const { uniqueString } = req.params;

  if (!uniqueString) throw new BadRequest('Invalid Request. Please check your input data.');

  try {
    const verification = await prisma.restaurantVerification.findFirst({
      where: {
        uniqueString,
      }
    });
    if (!verification) {
      throw new NotFound('Verification not found. Please check your verfication token.');
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        email: verification.email,
      },
    });
    if (!restaurant) {
      throw new NotFound('Restaurant is not found.');
    }
    if (restaurant.isVerified) {
      throw new Conflict('Email address already verified. You have already verified your email address.');
    }
    const isExpired = dayjs().isAfter(dayjs(verification.expiredAt));
    if (isExpired) {
      throw new InvalidToken('Request Id is expired. Please make a new verification request.');
    }

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { isVerified: true },
    });
  } catch (error: any) {
    throw error;
  }
};

const createResetPasswordRequest = async (req: Request): Promise<void | Error> => {
  try {
    const body: DTO.ResetPasswordRequestBody =
      DTO.resetPasswordRequestBody.parse(req.body);

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        email: body.email,
      },
    })

    if (restaurant) {
      await prisma.restaurantResetPasswordRequest.create({
        data: {
          restaurantId: restaurant.id,
          uniqueString: uuidv4(),
          expiredAt: dayjs().add(10, 'minutes').toISOString(),
        }
      });
    }
  } catch (error: any) {
    throw error;
  }
};

const checkingResetPassword = async (req: Request): Promise<void | Error> => {
  const { uniqueString } = req.params;

  if (!uniqueString) throw new BadRequest('Request not found. Please check your request id.');

  try {
    const resetPassswordRequest = await prisma.restaurantResetPasswordRequest.findFirst({
      where: {
        uniqueString,
      },
    });

    if (!resetPassswordRequest) {
      throw new NotFound('Request not found. Please check your request id.');
    }

    const isExpired = dayjs().isAfter(dayjs(resetPassswordRequest.expiredAt));
    if (isExpired) {
      throw new InvalidToken('Request Id is expired. Please make a new reset password request.');
    }
  } catch (error: any) {
    throw error;
  }
};

const createNewPasswordViaResetPassword = async (req: Request): Promise<void | Error> => {
  try {
    const body: DTO.NewPasswordViaResetPasswordBody =
      DTO.newPasswordViaResetPasswordBody.parse(req.body);

    const resetPassswordRequest = await prisma.restaurantResetPasswordRequest.findFirst({
      where: {
        uniqueString: body.requestId,
      }
    });
    if (!resetPassswordRequest) {
      throw new NotFound('Request not found. Please check your request id.');
    }

    const isExpired = dayjs().isAfter(dayjs(resetPassswordRequest.expiredAt));
    if (isExpired) {
      throw new InvalidToken('Request Id is expired. Please make a new reset password request.');
    }

    await prisma.restaurant.update({
      where: {
        id: resetPassswordRequest.restaurantId,
      },
      data: {
        password: body.password,
      }
    });
  } catch (error: any) {
    throw error;
  }
};

export {
  createReEmailVerificationRequest,
  checkingEmailVerification,
  createResetPasswordRequest,
  checkingResetPassword,
  createNewPasswordViaResetPassword,
};

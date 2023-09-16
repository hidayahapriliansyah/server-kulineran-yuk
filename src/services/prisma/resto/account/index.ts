import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

import * as DTO from './types';
import prisma from '../../../../db';
import createRestaurantVerification from '../../../../utils/createRestaurantVerification';
import { BadRequest, NotFound } from '../../../../errors';
import Conflict from '../../../../errors/Conflict';
import dayjs from 'dayjs';
import InvalidToken from '../../../../errors/InvalidToken';
import { renderEmailHTMLTempalate, sendVerificationEmail } from '../../../mail';

const createReEmailVerificationRequest = async (
  req: Request
): Promise<void | Error> => {
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
    const createdVerification = await createRestaurantVerification({ restaurantId: id, restaurantEmail: email });
    const emailHTMLTempalate = renderEmailHTMLTempalate('RESTO_VERIFICATION', {
      receiverName: accountWithEmailIsNotVerifiedExist.name,
      redirectLink: 'ngacoheulateusih',
      expiredAt: createdVerification.expiredAt,
    });
    await sendVerificationEmail(accountWithEmailIsNotVerifiedExist.email, emailHTMLTempalate);
  }
};

const checkingEmailVerification = async (
  req: Request
): Promise<void | Error> => {
  const { uniqueString } = req.params;

  if (!uniqueString) throw new BadRequest('uniqueString param is missing.');

  const verification = await prisma.restaurantVerification.findFirst({
    where: {
      uniqueString,
    }
  });
  if (!verification) {
    throw new NotFound('Verification request is not found.');
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { email: verification.email },
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
};

const createResetPasswordRequest = async (
  req: Request
): Promise<void | Error> => {
  const body: DTO.ResetPasswordRequestBody =
    DTO.resetPasswordRequestBody.parse(req.body);

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      email: body.email,
    },
  })

  if (restaurant) {
    const createdResetPasswordRequest = await prisma.restaurantResetPasswordRequest.create({
      data: {
        restaurantId: restaurant.id,
        uniqueString: uuidv4(),
        expiredAt: dayjs().add(10, 'minutes').toISOString(),
      }
    });
    const emailHTMLTempalate = renderEmailHTMLTempalate('RESTO_RESET_PASSWORD_REQUEST', {
      receiverName: restaurant.name,
      redirectLink: 'ngacoheulateusih',
      expiredAt: createdResetPasswordRequest.expiredAt,
    });
    await sendVerificationEmail(restaurant.email, emailHTMLTempalate);
  }
};

const checkingResetPassword = async (
  req: Request
): Promise<void | Error> => {
  const { uniqueString } = req.params;

  if (!uniqueString) throw new BadRequest('uniqueString param is missing.');

  const resetPassswordRequest = await prisma.restaurantResetPasswordRequest.findFirst({
    where: { uniqueString },
  });

  if (!resetPassswordRequest) {
    throw new NotFound('Request is not found.');
  }

  const isExpired = dayjs().isAfter(dayjs(resetPassswordRequest.expiredAt));
  if (isExpired) {
    throw new InvalidToken('Request is expired. Please make a new reset password request.');
  }
};

const createNewPasswordViaResetPassword = async (
  req: Request
): Promise<void | Error> => {
  const body: DTO.NewPasswordViaResetPasswordBody =
    DTO.newPasswordViaResetPasswordBody.parse(req.body);

  const resetPassswordRequest = await prisma.restaurantResetPasswordRequest.findFirst({
    where: {
      uniqueString: body.requestId,
    }
  });
  if (!resetPassswordRequest) {
    throw new NotFound('Request is not found.');
  }

  const isExpired = dayjs().isAfter(dayjs(resetPassswordRequest.expiredAt));
  if (isExpired) {
    throw new InvalidToken('Request is expired. Please make a new reset password request.');
  }

  await prisma.restaurant.update({
    where: {
      id: resetPassswordRequest.restaurantId,
    },
    data: {
      password: body.password,
    }
  });
};

export {
  createReEmailVerificationRequest,
  checkingEmailVerification,
  createResetPasswordRequest,
  checkingResetPassword,
  createNewPasswordViaResetPassword,
};

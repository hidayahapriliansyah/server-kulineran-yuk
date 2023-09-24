import { Request } from 'express';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../../../../db';
import createCustomerVerification from '../../../../utils/createCustomerVerification';
import { BadRequest, NotFound } from '../../../../errors';
import Conflict from '../../../../errors/Conflict';
import InvalidToken from '../../../../errors/InvalidToken';
import * as DTO from './types';
import { renderEmailHTMLTempalate, sendVerificationEmail } from '../../../mail';

const createReEmailVerificationRequest = async (
  req: Request
): Promise<void | Error> => {
  const body: DTO.ReEmailVerificationRequestBody =
    DTO.reEmailVerificationRequestBody.parse(req.body);

  const accountWithEmailIsNotVerifiedExist = await prisma.customer.findUnique({
    where: {
      email: body.email,
      isVerified: false,
    },
  });

  if (accountWithEmailIsNotVerifiedExist) {
    const { id, email, name } = accountWithEmailIsNotVerifiedExist;
    const createdVerification = await createCustomerVerification({ customerId: id, customerEmail: email });
    const emailHTMLTempalate = renderEmailHTMLTempalate('CUSTOMER_VERIFICATION', {
      receiverName: name,
      redirectLink: 'ngacoheulateusih',
      expiredAt: createdVerification.expiredAt,
    });
    await sendVerificationEmail(email, emailHTMLTempalate);
  }
};

const checkingEmailVerification = async (
  req: Request
): Promise<void | Error> => {
  const { uniqueString } = req.params;

  if (!uniqueString) throw new BadRequest('uniqueString param is missing.');

  const verification = await prisma.customerVerification.findFirst({
    where: { uniqueString },
  });
  if (!verification) {
    throw new NotFound('Verification is not found.');
  }

  const customer = await prisma.customer.findUnique({
    where: { email: verification.email }}
  );
  if (!customer) {
    throw new NotFound('Customer is not found.');
  }
  if (customer.isVerified) {
    throw new Conflict('Email address already verified. You have already verified your email address.');
  }
  const isExpired = dayjs().isAfter(dayjs(verification.expiredAt));
  if (isExpired) {
    throw new InvalidToken('Request Id is expired. Please make a new verification request.');
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: { isVerified: true },
  });
};

const createResetPasswordRequest = async (
  req: Request
): Promise<void | Error> => {
  const body: DTO.ResetPasswordRequestBody =
    DTO.resetPasswordRequestBody.parse(req.body);

  const customer = await prisma.customer.findUnique({
    where: { email: body.email },
  });

  if (customer) {
    const createdResetPasswordRequest = await prisma.customerResetPasswordRequest.create({
      data: {
        customerId: customer.id,
        uniqueString: uuidv4(),
        expiredAt: dayjs().add(10, 'minutes').toISOString(),
      }
    });    
    const emailHTMLTempalate = renderEmailHTMLTempalate('CUSTOMER_RESET_PASSWORD_REQUEST', {
      receiverName: customer.name,
      redirectLink: 'ngacoheulateusih',
      expiredAt: createdResetPasswordRequest.expiredAt,
    });
    await sendVerificationEmail(customer.email, emailHTMLTempalate);
  }
};

const checkingResetPassword = async (
  req: Request
): Promise<void | Error> => {
  const { uniqueString } = req.params;

  if (!uniqueString) throw new BadRequest('uniqueString param is missing.');

  const resetPassswordRequest = await prisma.customerResetPasswordRequest.findFirst({
    where: { uniqueString },
  });

  if (!resetPassswordRequest) {
    throw new NotFound('Resest Password Request is not found.');
  }

  const isExpired = dayjs().isAfter(dayjs(resetPassswordRequest.expiredAt));
  if (isExpired) {
    throw new InvalidToken('Resest Password Request is expired. Please make a new reset password request.');
  }
};

const createNewPasswordViaResetPassword = async (
  req: Request
): Promise<void | Error> => {
  const body: DTO.NewPasswordViaResetPasswordBody =
    DTO.newPasswordViaResetPasswordBody.parse(req.body);

  const resetPassswordRequest = await prisma.restaurantResetPasswordRequest.findFirst({
    where: { uniqueString: body.requestId },
  });
  if (!resetPassswordRequest) {
    throw new NotFound('Resest Password Request is not found.');
  }

  const isExpired = dayjs().isAfter(dayjs(resetPassswordRequest.expiredAt));
  if (isExpired) {
    throw new InvalidToken('Resest Password Request is expired. Please make a new reset password request.');
  }

  await prisma.restaurant.update({
    where: { id: resetPassswordRequest.restaurantId },
    data: { password: body.password },
  });
};

export {
  createReEmailVerificationRequest,
  checkingEmailVerification,
  createResetPasswordRequest,
  checkingResetPassword,
  createNewPasswordViaResetPassword,
};

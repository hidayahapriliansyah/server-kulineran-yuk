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

const createReEmailVerificationRequest = async (req: Request): Promise<void | Error> => {
  try {
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
  } catch (error: any) {
    throw error;
  }
};

const checkingEmailVerification = async (req: Request): Promise<void | Error> => {
  const { uniqueString } = req.params;

  if (!uniqueString) throw new BadRequest('Invalid Request. Please check your input data.');

  try {
    const verification = await prisma.customerVerification.findFirst({
      where: { uniqueString },
    });
    if (!verification) {
      throw new NotFound('Verification not found. Please check your verfication token.');
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
  } catch (error: any) {
    throw error;
  }
};

const createResetPasswordRequest = async (req: Request): Promise<void | Error> => {
  try {
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
  } catch (error: any) {
    throw error;
  }
};

const checkingResetPassword = async (req: Request): Promise<void | Error> => {
  const { uniqueString } = req.params;

  if (!uniqueString) throw new BadRequest('Request not found. Please check your request id.');

  try {
    const resetPassswordRequest = await prisma.customerResetPasswordRequest.findFirst({
      where: { uniqueString },
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
      where: { uniqueString: body.requestId },
    });
    if (!resetPassswordRequest) {
      throw new NotFound('Request not found. Please check your request id.');
    }

    const isExpired = dayjs().isAfter(dayjs(resetPassswordRequest.expiredAt));
    if (isExpired) {
      throw new InvalidToken('Request Id is expired. Please make a new reset password request.');
    }

    await prisma.restaurant.update({
      where: { id: resetPassswordRequest.restaurantId },
      data: { password: body.password },
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

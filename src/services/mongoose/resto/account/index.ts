import { Request } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

import Restaurant from '../../../../models/Restaurant';
import createRestaurantEmailVerification from '../../../../utils/createRestaurantEmailVerification';
import RestaurantVerification from '../../../../models/RestaurantVerification';
import { BadRequest, NotFound } from '../../../../errors';
import InvalidToken from '../../../../errors/InvalidToken';
import Conflict from '../../../../errors/Conflict';
import RestaurantResetPasswordRequest from '../../../../models/RestauranResetPasswordRequest';

import * as DTO from './types';

const createReEmailVerificationRequest = async (req: Request): Promise<void | Error> => {
  try {
    const body: DTO.ReEmailVerificationRequestBody =
      DTO.reEmailVerificationRequestBody.parse(req.body);

    const { email } = body;

    const accountWithEmailIsNotVerifiedExist = await Restaurant.findOne({
      email,
      isVerified: false,
    });

    if (accountWithEmailIsNotVerifiedExist) {
      const { _id: restaurantId, email: restaurantEmail } = accountWithEmailIsNotVerifiedExist;
      await createRestaurantEmailVerification({ restaurantId, restaurantEmail });
    }
  } catch (error: any) {
    throw error;
  }
};

const checkingEmailVerification = async (req: Request): Promise<void | Error> => {
  const { uniqueString } = req.params;

  if (!uniqueString) throw new BadRequest('Invalid Request. Please check your input data.');

  try {
    const verification = await RestaurantVerification.findOne({ uniqueString });
    if (!verification) {
      throw new NotFound('Verification not found. Please check your verfication token.');
    }

    const restaurant = await Restaurant.findOne({ email: verification.email });
    if (restaurant!.isVerified) {
      new Conflict('Email address already verified. You have already verified your email address.');
    }

    const isExpired = dayjs().isAfter(dayjs(verification.expiredAt));
    if (isExpired) {
      throw new InvalidToken('Request Id is expired. Please make a new verification request.');
    }

    await Restaurant.findByIdAndUpdate(restaurant!._id, {
      isVerified: true,
    });
  } catch (error: any) {
    throw error;
  }
};

const createResetPasswordRequest = async (req: Request): Promise<void | Error> => {
  try {
    const body: DTO.ResetPasswordRequestBody =
      DTO.resetPasswordRequestBody.parse(req.body);

    const { email } = body;

    const restaurant = await Restaurant.findOne({ email });

    if (restaurant) {
      await RestaurantResetPasswordRequest.create({
        restaurantId: restaurant._id,
        uniqueString: uuidv4(),
        expiredAt: dayjs().add(10, 'minutes').toISOString(),
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
    const resetPassswordRequest = await RestaurantResetPasswordRequest.findOne({
      uniqueString,
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

    const { password, requestId: uniqueString } = body;

    const resetPassswordRequest = await RestaurantResetPasswordRequest.findOne({ uniqueString });
    if (!resetPassswordRequest) {
      throw new NotFound('Request not found. Please check your request id.');
    }

    const isExpired = dayjs().isAfter(dayjs(resetPassswordRequest.expiredAt));
    if (isExpired) {
      throw new InvalidToken('Request Id is expired. Please make a new reset password request.');
    }

    await Restaurant.findOneAndUpdate({
      _id: resetPassswordRequest.restaurantId,
      password,
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

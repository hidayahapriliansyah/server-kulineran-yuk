import { Request } from 'express';
import { z } from 'zod';

import Restaurant from '../../../models/Restaurant';
import createRestaurantEmailVerification from '../../../utils/createRestaurantEmailVerification';
import RestaurantVerification from '../../../models/RestaurantVerification';
import { BadRequest, NotFound } from '../../../errors';
import dayjs from 'dayjs';
import InvalidToken from '../../../errors/InvalidToken';
import Conflict from '../../../errors/Conflict';

const createReEmailVerificationRequest = async (req: Request): Promise<void | Error> => {
  const createReEmailVerificationRequestBody = z.object({
    email: z.string().email().nonempty(),
  });

  type CreateReEmailVerificationRequestBody = z.infer<typeof createReEmailVerificationRequestBody>;

  try {
    const body: CreateReEmailVerificationRequestBody =
      createReEmailVerificationRequestBody.parse(req.body);

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

export {
  createReEmailVerificationRequest,
  checkingEmailVerification,
};

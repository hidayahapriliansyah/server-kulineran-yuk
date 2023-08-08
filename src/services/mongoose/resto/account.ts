import { Request } from 'express';
import { z } from 'zod';

import Restaurant from '../../../models/Restaurant';
import createRestaurantEmailVerification from '../../../utils/createRestaurantEmailVerification';

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

export {
  createReEmailVerificationRequest,
};

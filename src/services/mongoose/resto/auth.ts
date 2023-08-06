import { Request } from 'express';
import Restaurant, { IRestaurant } from '../../../models/Restaurant';
import { z } from 'zod';
import RestaurantVerification from '../../../models/RestaurantVerification';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import db from '../../../db';
import { BadRequest, Unauthorized } from '../../../errors';

const signupBodyForm = z.object({
  name: z.string().regex(/^[a-zA-Z0-9.,_\s-]+$/).min(3).max(50).nonempty(),
  username: z.string().regex(/^[a-z0-9._']+$/).min(3).max(30).nonempty(),
  email: z.string().email().max(254).nonempty(),
  password: z.string().min(6).nonempty(),
});

const signupForm = async (req: Request): Promise<IRestaurant['_id'] | Error> => {
  type SignupBodyForm = z.infer<typeof signupBodyForm>;
  type SignupPayload = SignupBodyForm & Pick<IRestaurant, 'passMinimumProfileSetting'>

  const body: SignupBodyForm = signupBodyForm.parse(req.body);
  const payload: SignupPayload = {
    ...body,
    passMinimumProfileSetting: true
  };

  const session = await db.startSession();
  try {
    session.startTransaction();

    const result = await Restaurant.create(payload);

    const { _id: restaurantId, email: restaurantEmail } = result;
    const now = moment();
    const expiredAt = now.add(10, 'minutes').utc().format();
    const uniqueString = uuidv4();

    await RestaurantVerification.create({
      restaurantId: restaurantId,
      email: restaurantEmail,
      uniqueString,
      expiredAt,
    });

    await session.commitTransaction();
    await session.endSession();

    return result._id;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    throw error;
  }
};

const signinForm = async (req: Request): Promise<IRestaurant | Error> => {
  try {
    type signinFormBody = {
      email: string;
      password: string;
    }
    const { email, password } = req.body as signinFormBody;

    if (!email || !password) {
      throw new BadRequest('Invalid Request. Please check your input data.');
    }

    const result = await Restaurant.findOne({ $or: [{ email }, { username: email }] });
    if (!result) {
      throw new Unauthorized('Credential Error. User is not exist.');
    }

    const isPasswordMatch = await result!.comparePassword(password);
    if (!isPasswordMatch) {
      throw new Unauthorized('Credential Error. User is not exist.');
    }

    return result;
  } catch (error: any) {
    throw error;
  }
};

export {
  signupForm,
  signinForm,
};

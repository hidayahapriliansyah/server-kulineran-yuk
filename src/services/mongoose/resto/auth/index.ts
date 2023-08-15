import { Request } from 'express';
import Restaurant, { IRestaurant } from '../../../../models/Restaurant';
import { z } from 'zod';
import RestaurantVerification from '../../../../models/RestaurantVerification';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import db from '../../../../db';
import { BadRequest, Unauthorized } from '../../../../errors';
import createRestaurantEmailVerification from '../../../../utils/createRestaurantEmailVerification';

import * as DTO from './types';

const signupForm = async (req: Request): Promise<IRestaurant['_id'] | Error> => {
  const body: DTO.SignupBodyForm = DTO.signupBodyForm.parse(req.body);
  const payload: DTO.SignupPayload = {
    ...body,
    passMinimumProfileSetting: true,
  };

  const session = await db.startSession();
  try {
    session.startTransaction();
    const result = await Restaurant.create(payload);
    const { _id: restaurantId, email: restaurantEmail } = result;
    await createRestaurantEmailVerification({ restaurantId, restaurantEmail });
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
    const { email, password } = req.body as DTO.SigninFormBody;
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

import { Request } from 'express';

import { Restaurant } from '@prisma/client';
import * as DTO from './types'
import prisma from '../../../../db';
import hashPassword from '../../../../utils/hashPassword';
import createRestaurantEmailVerification from '../../../../utils/createRestaurantEmailVerification';
import sendVerificationEmail from '../../../mail';
import { BadRequest, Unauthorized } from '../../../../errors';
import comparePassword from '../../../../utils/comparePassword';

const signupForm = async (req: Request): Promise<Restaurant['id'] | Error> => {
  const body: DTO.SignupBodyForm = DTO.signupBodyForm.parse(req.body);

  const createdRestaurantAccount = await prisma.restaurant.create({
    data: {
      name: body.name,
      username: body.username,
      email: body.email,
      password: await hashPassword(body.password),
      passMinimumProfileSetting: true,
    }
  });

  const createdVerification = await createRestaurantEmailVerification({
    restaurantId: createdRestaurantAccount.id,
    restaurantEmail: createdRestaurantAccount.email,
  });

  await sendVerificationEmail(createdRestaurantAccount.email, {
    link: `http://localhost:3000/resto/verification/${createdVerification.uniqueString}`,
    name: createdRestaurantAccount.name,
  });

  const result = createdRestaurantAccount.id;
  return result;
};

const signinForm = async (req: Request): Promise<Restaurant | Error> => {
  try {
    const { email, password } = req.body as DTO.SigninFormBody;
    if (!email || !password) {
      throw new BadRequest('Invalid Request. Please check your input data.');
    }
    // const result = await Restaurant.findOne({ $or: [{ email }, { username: email }] });
    const foundRestaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { email },
          { username: email },
        ],
      },
    });
    if (!foundRestaurant) {
      throw new Unauthorized('Credential Error. User is not exist.');
    }
    // const isPasswordMatch = await result!.comparePassword(password);
    const isPasswordMatch = await comparePassword(password, (foundRestaurant.password as string));
    if (!isPasswordMatch) {
      throw new Unauthorized('Credential Error. User is not exist.');
    }

    const result = foundRestaurant;
    return result;
  } catch (error: any) {
    throw error;
  }
};

export {
  signupForm,
  signinForm,
};

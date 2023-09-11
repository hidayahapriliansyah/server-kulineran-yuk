import { Request } from 'express';

import { Restaurant } from '@prisma/client';
import prisma from '../../../../db';
import hashPassword from '../../../../utils/hashPassword';
import createRestaurantVerification from '../../../../utils/createRestaurantVerification';
import { BadRequest, Unauthorized } from '../../../../errors';
import comparePassword from '../../../../utils/comparePassword';
import { renderEmailHTMLTempalate, sendVerificationEmail } from '../../../mail';
import * as DTO from './types';

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

  const createdVerification = await createRestaurantVerification({
    restaurantId: createdRestaurantAccount.id,
    restaurantEmail: createdRestaurantAccount.email,
  });

  const emailHTMLTempalate = renderEmailHTMLTempalate('RESTO_VERIFICATION', {
    receiverName: body.name,
    redirectLink: 'ngacoheulateusih',
    expiredAt: createdVerification.expiredAt,
  });
  await sendVerificationEmail(body.email, emailHTMLTempalate);

  const result = createdRestaurantAccount.id;
  return result;
};

const signinForm = async (req: Request): Promise<Restaurant | Error> => {
  try {
    const { email, password } = req.body as DTO.SigninFormBody;
    if (!email || !password) {
      throw new BadRequest('Invalid Request. Please check your input data.');
    }
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

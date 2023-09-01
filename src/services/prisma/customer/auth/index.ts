import { Request } from 'express';

import { Customer } from '@prisma/client';
import * as DTO from './types';
import prisma from '../../../../db';
import hashPassword from '../../../../utils/hashPassword';
import createCustomerEmailVerification from '../../../../utils/createCustomerEmailVerification';
import sendVerificationEmail from '../../../mail';
import { BadRequest, Unauthorized } from '../../../../errors';
import comparePassword from '../../../../utils/comparePassword';

const signupForm = async (req: Request): Promise<Customer['id'] | Error> => {
  const body: DTO.SignupBodyForm = DTO.signupBodyForm.parse(req.body);

  const createdRestaurantAccount = await prisma.customer.create({
    data: {
      name: body.name,
      username: body.username,
      email: body.email,
      password: await hashPassword(body.password),
    }
  });

  const createdVerification = await createCustomerEmailVerification({
    customerId: createdRestaurantAccount.id,
    customerEmail: createdRestaurantAccount.email,
  });

  await sendVerificationEmail(createdRestaurantAccount.email, {
    link: `http://localhost:3000/resto/verification/${createdVerification.uniqueString}`,
    name: createdRestaurantAccount.name,
  });

  const result = createdRestaurantAccount.id;
  return result;
};

const signinForm = async (req: Request): Promise<Customer | Error> => {
  try {
    const body = req.body as DTO.SigninFormBody;
    if (!body.email || !body.password) {
      throw new BadRequest('Invalid Request. Please check your input data.');
    }
    const foundCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: body.email },
          { username: body.email },
        ],
      },
    });
    if (!foundCustomer) {
      throw new Unauthorized('Credential Error. User is not exist.');
    }
    const isPasswordMatch = await comparePassword(body.password, foundCustomer.password as string);
    if (!isPasswordMatch) {
      throw new Unauthorized('Credential Error. User is not exist.');
    }
    return foundCustomer;
  } catch (error: any) {
    throw error;
  }
};

export {
  signupForm,
  signinForm,
};

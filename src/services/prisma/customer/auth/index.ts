import { Request } from 'express';

import { Customer } from '@prisma/client';
import * as DTO from './types';
import prisma from '../../../../db';
import hashPassword from '../../../../utils/hashPassword';
import createCustomerVerification from '../../../../utils/createCustomerVerification';
import { renderEmailHTMLTempalate, sendVerificationEmail } from '../../../mail';
import { BadRequest, Unauthorized } from '../../../../errors';
import comparePassword from '../../../../utils/comparePassword';

const signupForm = async (
  req: Request
): Promise<Customer['id'] | Error> => {
  const body: DTO.SignupBodyForm = DTO.signupBodyForm.parse(req.body);

  const createdRestaurantAccount = await prisma.customer.create({
    data: {
      name: body.name,
      username: body.username,
      email: body.email,
      password: await hashPassword(body.password),
    }
  });

  const createdVerification = await createCustomerVerification({
    customerId: createdRestaurantAccount.id,
    customerEmail: createdRestaurantAccount.email,
  });

  const emailHTMLTempalate = renderEmailHTMLTempalate('CUSTOMER_VERIFICATION', {
    receiverName: body.name,
    redirectLink: 'ngacoheulateusih',
    expiredAt: createdVerification.expiredAt,
  });
  await sendVerificationEmail(body.email, emailHTMLTempalate);

  const result = createdRestaurantAccount.id;
  return result;
};

const signinForm = async (
  req: Request
): Promise<Customer | Error> => {
  const body = req.body as DTO.SigninFormBody;
  if (!body.email || !body.password) {
    throw new BadRequest('password or email body payload is missing.');
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
};

export {
  signupForm,
  signinForm,
};

import { Request } from 'express';
import db from '../../../../db';
import { BadRequest, Unauthorized } from '../../../../errors';

import * as DTO from './types';
import Customer, { ICustomer } from '../../../../models/Customer';
import createCustomerEmailVerification from '../../../../utils/createCustomerEmailVerification';

const signupForm = async (req: Request): Promise<ICustomer['_id'] | Error> => {
  const body: DTO.SignupBodyForm = DTO.signupBodyForm.parse(req.body);
  const payload: DTO.SignupPayload = {
    ...body,
    passMinimumProfileSetting: true,
  };

  const session = await db.startSession();
  try {
    session.startTransaction();
    const result = await Customer.create(payload);
    const { _id: customerId, email: customerEmail } = result;
    await createCustomerEmailVerification({ customerId, customerEmail  });
    await session.commitTransaction();
    await session.endSession();
    return result._id;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const signinForm = async (req: Request): Promise<ICustomer | Error> => {
  try {
    const { email, password } = req.body as DTO.SigninFormBody;
    if (!email || !password) {
      throw new BadRequest('Invalid Request. Please check your input data.');
    }
    const result = await Customer.findOne({ $or: [{ email }, { username: email }] });
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

import { Request } from 'express';

import * as DTO from './types';
import Customer, { ICustomer } from '../../../../models/Customer';
import { NotFound } from '../../../../errors';

const getCustomerProfile = async (req: Request):
  Promise<DTO.CustomerProfileResponse | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'name'>;
    try {
      const customerProfile = await Customer.findById(customerId);

      const result: DTO.CustomerProfileResponse = {
        _id: customerProfile!._id,
        avatar: customerProfile!.avatar,
        username: customerProfile!.username,
        name: customerProfile!.name,
      };
      return result;
    } catch (error: any) {
      throw error;
    }
  };

const updateCustomerProfile = async (req: Request):
  Promise<DTO.CustomerProfileResponse['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'name'>;
    try {
      const body: DTO.UpdateCustomerProfileBody = 
        DTO.updateCustomerProfileBodySchema.parse(req.body);

      const updatedCustomerProfile =
        await Customer.findByIdAndUpdate(customerId, {
          avatar: body.avatar,
          username: body.username,
          name: body.name,
        }) as ICustomer;

      const { _id: result } = updatedCustomerProfile;
      return result;
    } catch (error: any) {
      throw error;
    }
  };

const updateCustomerJoinBotramMethod = async (req: Request):
  Promise<DTO.CustomerProfileResponse['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'name'>;
    try {
      const body: DTO.UpdateCustomerJoinBotramMethodBodySchema = 
        DTO.updateCustomerJoinBotramMethodBodySchema.parse(req.body);

      const updatedCustomerJoinBotramMethod = 
        await Customer.findByIdAndUpdate(customerId, {
          joinBotram: body.joinBotram,
        }) as ICustomer;

      const { _id: result } = updatedCustomerJoinBotramMethod;
      return result;
    } catch (error: any) {
      throw error;
    }
  };

export {
  getCustomerProfile,
  updateCustomerProfile,
  updateCustomerJoinBotramMethod,
};

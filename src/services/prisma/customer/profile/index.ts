import { Request } from 'express';

import * as DTO from './types';
import { Customer } from '@prisma/client';
import prisma from '../../../../db';

const getCustomerProfile = async (
  req: Request
): Promise<DTO.CustomerProfileResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'name'>;

  const customerProfile = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  const result: DTO.CustomerProfileResponse = {
    id: customerProfile!.id,
    avatar: customerProfile!.avatar,
    username: customerProfile!.username,
    name: customerProfile!.name,
  };
  return result;
};

const updateCustomerProfile = async (
  req: Request
): Promise<DTO.CustomerProfileResponse['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'name'>;

  const body: DTO.UpdateCustomerProfileBody = 
    DTO.updateCustomerProfileBodySchema.parse(req.body);

  const updatedCustomerProfile = await prisma.customer.update({
    where: { id: customerId },
    data: {
      avatar: body.avatar,
      username: body.username,
      name: body.name,
    },
  });

  return updatedCustomerProfile.id;
};

const updateCustomerJoinBotramMethod = async (
  req: Request
): Promise<DTO.CustomerProfileResponse['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'name'>;

  const body: DTO.UpdateCustomerJoinBotramMethodBodySchema = 
    DTO.updateCustomerJoinBotramMethodBodySchema.parse(req.body);

  const updatedCustomerJoinBotramMethod = await prisma.customer.update({
    where: { id: customerId },
    data: { joinBotram: body.joinBotram as 'DIRECTLY' | 'INVITATION' | 'BYSELF' },
  });

  return updatedCustomerJoinBotramMethod.id;
};

export {
  getCustomerProfile,
  updateCustomerProfile,
  updateCustomerJoinBotramMethod,
};

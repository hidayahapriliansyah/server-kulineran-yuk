import { NextFunction, Request, Response } from 'express';

import { Customer } from '@prisma/client';
import { BadRequest, NotFound, Unauthorized } from '../errors';
import prisma from '../db';

const isGroupBotramAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  try {
    const { botramId } = req.params;
    if (!botramId) {
      throw new BadRequest('botramId param is missing.');
    }

    const isGroupBotramAdmin = await prisma.botramGroup.findUnique({
      where: { id: botramId, creatorCustomerId: customerId },
    });
    if (!isGroupBotramAdmin) {
      throw new Unauthorized('Only for admin of botram group. Access to this resource is forbidden.');
    }

    next();
  } catch (error: any) {
    next(error);
  }
};

export default isGroupBotramAdmin;

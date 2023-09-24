import { NextFunction, Request, Response } from 'express';
import { BadRequest, NotFound, Unauthorized } from '../errors';

import { Customer } from '@prisma/client';
import prisma from '../db';

const isGroupBotramMember = async (
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

    const isGroupBotramMember = await prisma.botramGroupMember.findFirst({
      where: {
        customerId,
        botramGroupId: botramId,
        OR: [
          { status: 'ORDERING' },
          { status: 'ORDER_READY' },
        ],
      },
    });

    if (!isGroupBotramMember) {
      throw new Unauthorized('Customer is not part of member. Access to this resource is forbidden.');
    }
    next();
  } catch (error: any) {
    next(error);
  }
};

export default isGroupBotramMember;

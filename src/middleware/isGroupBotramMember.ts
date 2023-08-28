import { NextFunction, Request, Response } from 'express';
import { ICustomer } from '../models/Customer';
import { BadRequest, NotFound, Unauthorized } from '../errors';
import GroupBotramMember from '../models/GroupBotramMember';

const isGroupBotramMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Error > => {
  const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
  try {
    const { botramId } = req.params;
    if (!botramId) {
      throw new BadRequest('Invalid request. botramId param is missing.');
    }

    const isGroupBotramMember =
      await GroupBotramMember.findOne({
        customerId,
        groupBotramId: botramId,
        status: { $in: [ 'ordering', 'orderready' ] },
      });

    if (!isGroupBotramMember) {
      throw new Unauthorized('Customer is not part of member. Access to this resource is forbidden.');
    }
    next();
  } catch (error: any) {
    if (error.name === 'CastError') {
      next(new NotFound('Group botram is not found.'));
    }
    next(error);
  }
};

export default isGroupBotramMember;

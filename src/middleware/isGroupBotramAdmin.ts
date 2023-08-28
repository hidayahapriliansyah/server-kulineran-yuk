import { NextFunction, Request, Response } from 'express';
import { ICustomer } from '../models/Customer';
import { BadRequest, NotFound, Unauthorized } from '../errors';
import GroupBotram from '../models/GroupBotram';

const isGroupBotramAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Error> => {
  const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
  try {
    const { botramId } = req.params;
    if (!botramId) {
      throw new BadRequest('Invalid request. botramId param is missing.');
    }

    const isGroupBotramAdmin = await GroupBotram.findOne({
      _id: botramId,
      creatorCustomerId: customerId,
    });
    if (!isGroupBotramAdmin) {
      throw new Unauthorized('Only for admin of botram group. Access to this resource is forbidden.');
    }

    next();
  } catch (error: any) {
    if (error.name === 'CastError') {
      next(new NotFound('Group botram is not found.'));
    }
    next(error);
  }
};

export default isGroupBotramAdmin;

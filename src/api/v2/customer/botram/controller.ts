import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BotramGroup, BotramGroupMember } from '@prisma/client';
import { SuccessAPIResponse } from '../../../../global/types';
import * as botramService from '../../../../services/prisma/customer/botram';
import * as DTO from '../../../../services/prisma/customer/botram/types';

const getAllCustomerBotramGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await botramService.getAllCustomerBotramGroup(req) as DTO.GetAllCustomerBotramGroupResponse;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get botram group data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const findCustomerToBeAddedToBotramGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await botramService.findCustomerToBeAddedToBotramGroup(req) as DTO.FindCustomerResponse;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Find customer sucessfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const createBotramGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await botramService.createBotramGroup(req) as BotramGroup['id'];

    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Create botram group successfully.', {
        botramGroupId: result,
      }))
  } catch (error: any) {
    next(error);
  }
};

const getSpecificCustomerBotramGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await botramService.getSpecificCustomerBotramGroup(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get botram group information successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const joinOpenMemberBotramGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await botramService.joinOpenMemberBotramGroup(req) as BotramGroupMember['id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Join botram group successfully.', {
        memberId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const exitFromBotramGroupForMemberOnly = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await botramService.exitFromBotramGroupForMemberOnly(req) as BotramGroupMember['id'];
    
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Exit botram group successfully.', {
        memberId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getMemberAndMemberOrderOfBotramGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await botramService.getMemberAndMemberOrderOfBotramGroup(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Exit botram group successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const kickMemberBotramGroupByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await botramService.kickMemberBotramGroupByAdmin(req) as BotramGroupMember['id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Expel member successfully', {
        memberId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const updateMemberStatusPaymentByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await botramService.updateMemberStatusPaymentByAdmin(req) as BotramGroupMember['id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Update member payment status successfully.', {
        memberId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const updateGroupBotramStatusToAllReadyOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await botramService.updateGroupBotramStatusToAllReadyOrder(req) as BotramGroup['id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Update member payment status successfully.', {
        memberId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getAllCustomerBotramGroup,
  findCustomerToBeAddedToBotramGroup,
  createBotramGroup,
  getSpecificCustomerBotramGroup,
  joinOpenMemberBotramGroup,
  exitFromBotramGroupForMemberOnly,
  getMemberAndMemberOrderOfBotramGroup,
  kickMemberBotramGroupByAdmin,
  updateMemberStatusPaymentByAdmin,
  updateGroupBotramStatusToAllReadyOrder,
};

import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as invitationService from '../../../../services/prisma/customer/invitations';
import * as DTO from '../../../../services/prisma/customer/invitations/types';

const getAllInvitationsBotramGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await invitationService.getAllInvitationsBotramGroup(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get botram group data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const getSpecificInvitationBotramGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await invitationService.getSpecificInvitationBotramGroup(req) as DTO.InvitationBotramGroupResponse;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get botram group invitations successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const acceptInvitationBotramGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = 
      await invitationService.acceptInvitationBotramGroup(req) as DTO.InvitationBotramGroupResponse['id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Accept invitation successfully.', {
        invitationId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const rejectInvitationsBotramGroup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await invitationService.rejectInvitationsBotramGroup(req) as DTO.InvitationBotramGroupResponse['id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Reject invitation successfully', {
        invitationId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getAllInvitationsBotramGroup,
  getSpecificInvitationBotramGroup,
  acceptInvitationBotramGroup,
  rejectInvitationsBotramGroup,
};

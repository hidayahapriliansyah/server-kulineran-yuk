import { Request } from 'express';

import * as DTO from './types';
import { Customer } from '@prisma/client';
import prisma from '../../../../db';
import { BadRequest, NotFound, Unauthorized } from '../../../../errors';

const getAllInvitationsBotramGroup = async (
  req: Request,
): Promise<DTO.GetAllInvitationsBotramGroupResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>

  const invitations = await prisma.botramGroupInvitation.findMany({
    where: { customerId, status: 'NORESPONSE', isActive: true },
    include: {
      botramGroup: {
        include: {
          restaurant: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
        select: {
          id: true,
          createdAt: true,
          name: true,
          status: true,
        },
      },
    },
  });

  const result: DTO.GetAllInvitationsBotramGroupResponse =
    invitations.map((inv) => ({
      id: inv.id,
      groupBotram: {
        id: inv.botramGroup.id,
        createdAt: inv.botramGroup.createdAt,
        name: inv.botramGroup.name,
        status: inv.botramGroup.status,
        restaurant: {
          id: inv.botramGroup.restaurant.id,
          username: inv.botramGroup.restaurant.username,
          name: inv.botramGroup.restaurant.name,
        },
      },
    }));

    return result;
};

const getSpecificInvitationBotramGroup = async (
  req: Request,
): Promise<DTO.InvitationBotramGroupResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>

  const { invitationId } = req.params;

  const invitation = await prisma.botramGroupInvitation.findUnique({
    where: {
      id: invitationId,
      customerId,
      status: 'NORESPONSE',
      isActive: true,
    },
    include: {
      botramGroup: {
        include: {
          restaurant: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          creatorCustomer: {
            select: {
              username: true,
              name: true,
            },
          },
        },
        select: {
          id: true,
          createdAt: true,
          name: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new NotFound('Invitation is not found.');
  }

  const memberCount = await prisma.botramGroupMember.count({
    where: { botramGroupId: invitation.botramGroupId, status: 'ORDERING' },
  });
  const result: DTO.InvitationBotramGroupResponse = {
    id: invitation.id,
    groupBotram: {
      id: invitation.botramGroup.id,
      createdAt: invitation.botramGroup.createdAt,
      name: invitation.botramGroup.name,
      restaurant: {
        id: invitation.botramGroup.restaurant.id,
        username: invitation.botramGroup.restaurant.username,
        name: invitation.botramGroup.restaurant.name,
      },
      status: invitation.botramGroup?.status,
      admin: {
        username: invitation.botramGroup.creatorCustomer.username,
        name:invitation.botramGroup.creatorCustomer.name,
      },
      memberCount,
    },
  };

  return result;
};

const acceptInvitationBotramGroup = async (
  req: Request,
): Promise<DTO.InvitationBotramGroupResponse['id'] | Error>  => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const customerIsJoiningActiveBotramGroup = await prisma.botramGroupMember.findFirst({
    where: { customerId, status: 'ORDERING'},
  });
  if (customerIsJoiningActiveBotramGroup) {
    throw new Unauthorized('Cannot accept invitation. Customer is ordering in active botram group.');
  }

  const { invitationId } = req.params;

  const updatedInvitation = await prisma.botramGroupInvitation.update({
    where: { id: invitationId, customerId, status: 'NORESPONSE', isActive: true },
    data: { status: 'ACCEPTED', isActive: false },
  });
  if (!updatedInvitation) {
    throw new NotFound('Invitation is not found.');
  }

  const foundBotramMember = await prisma.botramGroupMember.findFirst({
    where: { botramGroupId: updatedInvitation.botramGroupId, customerId },
  });
  const updatedMemberStatus = await prisma.botramGroupMember.update({
    where: { id: foundBotramMember!.id, botramGroupId: updatedInvitation.botramGroupId },
    data: { status: 'ORDERING' },
  });
  if (!updatedMemberStatus) {
    await prisma.botramGroupInvitation.delete({
      where: { id: updatedInvitation.id },
    });
    throw new NotFound('Group Botram is not found.');
  }

  const result = updatedInvitation.id;
  return result;
};

const rejectInvitationsBotramGroup = async (
  req: Request,
): Promise<DTO.InvitationBotramGroupResponse['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>

  const { invitationId } = req.params;

  if (!invitationId) {
    throw new BadRequest('invitationId param is missing.');
  }

  const rejectedInvitation = await prisma.botramGroupInvitation.update({
    where: { id: invitationId, customerId },
    data: { status: 'REJECTED' },
  });

  if (!rejectedInvitation) {
    throw new NotFound('Invitation is not found.');
  }

  const result = rejectedInvitation.id;
  return result;
};

export {
  getAllInvitationsBotramGroup,
  getSpecificInvitationBotramGroup,
  acceptInvitationBotramGroup,
  rejectInvitationsBotramGroup,
};

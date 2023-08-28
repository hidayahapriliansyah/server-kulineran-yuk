import { Request } from 'express';

import * as DTO from './types';
import { ICustomer } from '../../../../models/Customer';
import GroupBotramInvitation from '../../../../models/GroupBotramInvitation';
import { IGroupBotram } from '../../../../models/GroupBotram';
import { IRestaurant } from '../../../../models/Restaurant';
import GroupBotramMember from '../../../../models/GroupBotramMember';
import { BadRequest, NotFound } from '../../../../errors';
import db from '../../../../db';

const getAllInvitationsBotramGroup = async (req: Request):
  Promise<DTO.GetAllInvitationsBotramGroupResponse | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>
    try {
      const invitations =
        await GroupBotramInvitation.find({ customerId, status: 'noresponse', isActive: true })
          .populate({
            path: 'groupBotramId',
            select: '_id createdAt name restaurantId status',
            populate: {
              path: 'restaurantId',
              select: '_id username name',
            },
          });

      const result: DTO.GetAllInvitationsBotramGroupResponse =
        invitations.map((inv) => ({
          _id: inv._id,
          groupBotram: {
            _id: (inv.groupBotramId as IGroupBotram)?._id,
            createdAt: (inv.groupBotramId as IGroupBotram)?.createdAt,
            name: (inv.groupBotramId as IGroupBotram)?.name,
            status: (inv.groupBotramId as IGroupBotram)?.status,
            restaurant: {
              _id: ((inv.groupBotramId as IGroupBotram)?.restaurantId as IRestaurant)?._id,
              username: ((inv.groupBotramId as IGroupBotram)?.restaurantId as IRestaurant)?.username,
              name: ((inv.groupBotramId as IGroupBotram)?.restaurantId as IRestaurant)?.name,
            },
          },
        }));

        return result;
    } catch (error: any) {
      throw error;
    }
  };

const getSpecificInvitationBotramGroup = async (req: Request):
  Promise<DTO.InvitationBotramGroupResponse | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>
    try {
      const { invitationId } = req.params;

      const invitation = await GroupBotramInvitation.findOne({
        _id: invitationId,
        customerId,
        status: 'noresponse',
        isActive: true,
      })
        .populate({
          path: 'groupBotramId',
          select: '_id createdAt name status restaurantId creatorCustomerId',
          populate: [
            {
              path: 'restaurantId',
              select: '_id username name',
            },
            {
              path: 'creatorCustomerId',
              select: 'username name',
            },
          ],
        });

      if (!invitation) {
        throw new NotFound('Invitation Id not found. Please input valid invitation id.');
      }

      const memberCount = await GroupBotramMember.countDocuments({
        groupBotramId: invitation?.groupBotramId,
        status: 'ordering',
      });

      const result: DTO.InvitationBotramGroupResponse = {
        _id: invitation._id,
        groupBotram: {
          _id: ((invitation.groupBotramId) as IGroupBotram)?._id,
          createdAt: ((invitation.groupBotramId) as IGroupBotram)?.createdAt,
          name: ((invitation.groupBotramId) as IGroupBotram)?.name,
          restaurant: {
            _id: (((invitation.groupBotramId) as IGroupBotram)?.restaurantId as IRestaurant)?._id,
            username: (((invitation.groupBotramId) as IGroupBotram)?.restaurantId as IRestaurant)?.username,
            name: (((invitation.groupBotramId) as IGroupBotram)?.restaurantId as IRestaurant)?.name,
          },
          status: ((invitation.groupBotramId) as IGroupBotram)?.status,
          admin: {
            username: (((invitation.groupBotramId) as IGroupBotram)?.creatorCustomerId as ICustomer)?.username,
            name:(((invitation.groupBotramId) as IGroupBotram)?.creatorCustomerId as ICustomer)?.name,
          },
          memberCount,
        },
      };

      return result;
    } catch (error: any) {
      throw error;
    }
  };

const acceptInvitationBotramGroup = async (req: Request):
  Promise<DTO.InvitationBotramGroupResponse['_id'] | Error>  => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>
    try {
      const { invitationId } = req.params;

      const updatedInvitation= await GroupBotramInvitation.findOneAndUpdate(
        {
          _id: invitationId,
          customerId,
          status: 'noresponse',
          isActive: true,
        },
        { status: 'accepted' },
      );
      if (!updatedInvitation) {
        throw new NotFound('Invitation Id not found. Please input valid invitation id.');
      }

      const updatedMemberStatus = await GroupBotramMember.findOneAndUpdate(
        {
          groupBotramId: updatedInvitation.groupBotramId,
          customerId,
        },
        { status: 'ordering' },
      );
      if (!updatedMemberStatus) {
        await GroupBotramInvitation.findByIdAndDelete(updatedInvitation._id);
        throw new NotFound('Group Botram not found.');
      }

      const result = updatedInvitation._id;
      return result;
    } catch (error: any) {
      if (error.name === 'CasError') {
        throw new NotFound('Invitation Id not found. Please input valid invitation id.');
      }
      throw error;
    }
  };

const rejectInvitationsBotramGroup = async (req: Request):
  Promise<DTO.InvitationBotramGroupResponse['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>
    try {
      const { invitationId } = req.params;

      if (!invitationId) {
        throw new BadRequest('Invalid request. invitationId param is missing.');
      }

      const rejectedInvitation = await GroupBotramInvitation.findOneAndUpdate(
        { _id: invitationId, customerId },
        { status: 'rejected' },
      );

      if (!rejectedInvitation) {
        throw new NotFound('Invitation not found. Please input valid invitationId.');
      }

      const result = rejectedInvitation._id;
      return result;
    } catch (error: any) {
      throw error;
    }
  };
export {
  getAllInvitationsBotramGroup,
  getSpecificInvitationBotramGroup,
  acceptInvitationBotramGroup,
  rejectInvitationsBotramGroup,
};
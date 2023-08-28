import { Request } from 'express';

import Customer, { ICustomer, joinBotramSetting } from '../../../../models/Customer';
import GroupBotram, { IGroupBotram } from '../../../../models/GroupBotram';
import GroupBotramMember, { GroupBotramMemberStatus, IGroupBotramMember } from '../../../../models/GroupBotramMember';
import { IRestaurant } from '../../../../models/Restaurant';
import * as DTO from './types';
import { BadRequest, NotFound } from '../../../../errors';
import GroupBotramOrder, { GroupBotramOrderStatus } from '../../../../models/GroupBotramOrder';
import GroupBotramMemberOrder from '../../../../models/GroupBotramMemberOrder';
import mongoose, { mongo } from 'mongoose';
import Order, { IOrder } from '../../../../models/Order';
import db from '../../../../db';
import OrderedMenu from '../../../../models/OrderedMenu';
import { IMenu } from '../../../../models/Menu';
import GroupBotramInvitation from '../../../../models/GroupBotramInvitation';

const getAllCustomerBotramGroup = async (req: Request):
  Promise<DTO.GetAllCustomerBotramGroupResponse | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    try {
      const joinedGroupBotrams = await GroupBotramMember.find(
        { customerId, $or: [ { status: 'ordering' }, { status: 'orderready' } ] }
      )
        .populate({
          path: 'groupBotramId',
          select: '_id createdAt creatorCustomerId restaurantId name status',
          populate: [
            {
              path: 'creatorCustomerId',
              select: '_id',
            },
            {
              path: 'restaurantId',
              select: '_id username name',
            },
          ],
        })
        .select('groupBotramId');

      const result: DTO.GetAllCustomerBotramGroupResponse = joinedGroupBotrams
        .filter((joinedGroupBotram) => joinedGroupBotram.groupBotramId !== null)
        .map((joinedGroupBotram) => ({
          _id: (joinedGroupBotram.groupBotramId as IGroupBotram)?._id,
          createdAt: (joinedGroupBotram.groupBotramId as IGroupBotram)?.createdAt,
          name: (joinedGroupBotram.groupBotramId as IGroupBotram)?.name,
          restaurant: {
            _id: ((joinedGroupBotram.groupBotramId as IGroupBotram)?.restaurantId as IRestaurant)?._id,
            username: ((joinedGroupBotram.groupBotramId as IGroupBotram)?.restaurantId as IRestaurant)?.username,
            name: ((joinedGroupBotram.groupBotramId as IGroupBotram)?.restaurantId as IRestaurant)?.name,
          },
          status: (joinedGroupBotram.groupBotramId as IGroupBotram)?.status,
          memberStatus: ((joinedGroupBotram.groupBotramId as IGroupBotram)?.creatorCustomerId.toString())
              === customerId.toString() ? 'admin' : 'member',
        }));

      return result;
    } catch (error: any) {
      throw error;
    }
  };

const findCustomerToBeAddedToBotramGroup = async (req: Request):
  Promise<DTO.FindCustomerResponse | Error> => {
    try {
      const { customerUsername } = req.params;

      const foundCustomer = await Customer.findOne({ username: customerUsername });
      if (!foundCustomer) {
        throw new NotFound('Customer is not found.');
      }

      const result: DTO.FindCustomerResponse = {
        _id: foundCustomer._id,
        username: foundCustomer.username,
        name: foundCustomer.name,
        avatar: foundCustomer.avatar,
      };
      return result;
    } catch (error: any) {
      throw error;
    }
  }

const createBotramGroup = async (req: Request):
  Promise<IGroupBotram['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    const body: DTO.CreateBotramGroupBody =
      DTO.createBotramGroupBodySchema.parse(req.body);

    const session = await db.startSession();
    try {
      session.startTransaction();
      const createdBotramGroup = await GroupBotram.create({
        creatorCustomerId: customerId,
        restaurantId: body.restaurantId,
        name: body.name,
      });
      await Promise.all(body.members.map(async (member) => {
        try {
          const customerExist = await Customer.findById(member._id);
          if (!customerExist) {
            throw new NotFound('Customer is not found.');
          }
          if (customerExist.joinBotram === joinBotramSetting.BYSELF) {
            return;
          }
          let statusJoinGroupBotram: GroupBotramMemberStatus;
          if (customerExist.joinBotram === joinBotramSetting.DIRECTLY) {
            statusJoinGroupBotram = GroupBotramMemberStatus.ORDERING;
          } else {
            await GroupBotramInvitation.create({
              groupBotramId: createdBotramGroup._id,
              customerId,
            });
            statusJoinGroupBotram = GroupBotramMemberStatus.NOTJOINYET;
          }
          await GroupBotramMember.create({
            groupBotramId: createdBotramGroup._id,
            customerId: customerExist._id,
            status: statusJoinGroupBotram,
          });
        } catch (error: any) {
          if (error.name === 'CastError') {
            throw new NotFound('Customer is not found.');
          }
          throw error;
        }
      }));
      await GroupBotramMember.create({
        groupBotramId: createdBotramGroup._id,
        customerId,
        status: GroupBotramMemberStatus.ORDERING,
      });
      session.commitTransaction();
      session.endSession();

      const result = createdBotramGroup._id;
      return result;
    } catch (error: any) {
      session.abortTransaction();
      session.endSession();
      throw error;
    }
  };

const getSpecificCustomerBotramGroup = async (req: Request):
  Promise<DTO.BotramResponse | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    try {
      const { botramId } = req.params;
      
      const joinedGroupBotram = await GroupBotramMember.findOne({
        customerId,
        groupBotramId: botramId,
        $or: [ { status: 'ordering' }, { status: 'orderready' }, { status: 'notjoinyet' } ],
      })
        .populate({
          path: 'groupBotramId',
          populate: [
            {
              path: 'creatorCustomerId',
              select: 'name username',
            },
            {
              path: 'restaurantId',
              select: '_id username name',
            },
          ],
        });
      if (!joinedGroupBotram) {
        throw new NotFound('Group botram is not found.');
      }

      const memberCount = await GroupBotramMember.countDocuments({
        groupBotramId: botramId,
        $or: [ { status: 'ordering' }, { status: 'orderready' } ],
      });

      const result: DTO.BotramResponse = {
        _id: (joinedGroupBotram.groupBotramId as IGroupBotram)?._id,
        createdAt: (joinedGroupBotram.groupBotramId as IGroupBotram)?.createdAt,
        name: (joinedGroupBotram.groupBotramId as IGroupBotram)?.name,
        admin: {
          username: ((joinedGroupBotram.groupBotramId as IGroupBotram)?.creatorCustomerId as ICustomer)?.username,
          name: ((joinedGroupBotram.groupBotramId as IGroupBotram)?.creatorCustomerId as ICustomer)?.name,
        },
        restaurant: {
          _id: ((joinedGroupBotram.groupBotramId as IGroupBotram)?.restaurantId as IRestaurant)?._id,
          name: ((joinedGroupBotram.groupBotramId as IGroupBotram)?.restaurantId as IRestaurant)?.name,
          username: ((joinedGroupBotram.groupBotramId as IGroupBotram)?.restaurantId as IRestaurant)?.username,
        },
        status: (joinedGroupBotram.groupBotramId as IGroupBotram)?.status,
        memberCount, 
      };
      return result;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Group botram is not found.');
      }
      throw error;
    }
  };

const joinOpenMemberBotramGroup = async (req: Request):
  Promise<IGroupBotramMember['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    const { botramId } = req.params;
    if (!botramId) {
      throw new BadRequest('Invalid request. botramId param is missing.');
    }
    try {
      const groupBotram = await GroupBotram.findOne({
        _id: botramId,
        openMembership: true,
      });

      if (!groupBotram) {
        throw new NotFound('Botram group is not found.');
      }

      const becomingMemberBotramGroup = await GroupBotramMember.create({
        groupBotramId: botramId,
        customerId,
        status: 'ordering',
      });

      const result = becomingMemberBotramGroup._id;
      return result;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Botram group is not found.');
      }
      throw error;
    }
  };

const exitFromBotramGroupForMemberOnly = async (req: Request):
  Promise<IGroupBotramMember['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    const { botramId } = req.params;
    if (!botramId) {
      throw new BadRequest('Invalid request. botramId param is missing.');
    }
    try {
      // cek dulu order botram nya udah mau dipesenin gak
      const checkOrderBotramGroup = await GroupBotramOrder.findOne({ groupBotramId: botramId });

      if (checkOrderBotramGroup) {
        throw new BadRequest('Invalid request. Botram group order already processed. Member can not exit.');
      }

      const exitBotramGroup = await GroupBotramMember.findOneAndUpdate(
        {
          groupBotramId: botramId,
          customerId,
          status: { $in: [ 'ordering', 'orderready' ] },
        },
        { status: 'exit' },
      );
      if (!exitBotramGroup) {
        throw new NotFound('Botram group is not found.');
      }

      const result = exitBotramGroup._id;
      return result;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Botram group is not found.');
      }
      throw error;
    }
  };

const getMemberAndMemberOrderOfBotramGroup = async (req: Request):
  Promise<DTO.GetMemberAndMemberOrderBotramGroup | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    const { botramId } = req.params;
    if (!botramId) {
      throw new BadRequest('Invalid request. botramId param is missing.');
    }
    try {
      // manual dlu
      // dapetin list memberId
      const memberList = await GroupBotramMember.find({ groupBotramId: botramId, status: 'orderready' });
      memberList.map(async (member) => {
        
      });
      // query orderId dari botram MemberId berdasarkan memberId
      const memberAndMemberOrder =
        await GroupBotramMember.find({ groupBotramId: botramId });

      const gropBotramOrder =
        await GroupBotramMemberOrder.find();

    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Botram Group is not found.');
      }
      throw error;
    }
  };

const kickMemberBotramGroupByAdmin = async (req: Request):
  Promise<IGroupBotramMember['_id'] | Error> => {
    const { botramId, memberId } = req.params;
    if (!botramId) {
      throw new BadRequest('Invalid request. botramId param is missing.');
    }
    if (!memberId) {
      throw new BadRequest('Invalid request. memberId param is missing.');
    }
    try {
      const groupBotram = await GroupBotram.findById(botramId);
      if (!groupBotram) {
        throw new NotFound('Botram group is not found.');
      }
      if (groupBotram.status !== 'ordering') {
        throw new BadRequest('Botram group is not ordering. Member can not be expelled.');
      };

      const kickedMember = await GroupBotramMember.findOneAndUpdate(
        { customerId: memberId, groupBotramId: botramId },
        { status: 'expelled' },
      );
      if (!kickedMember) {
        throw new NotFound('Member is not found.');
      }

      const result = kickedMember._id;
      return result;
    } catch (error: any) {
      if (error.name === 'CastError') {
        if ((error as mongoose.CastError).stringValue === botramId) {
          throw new NotFound('Botram group is not found.');
        } else {
          throw new NotFound('Member is not found.');
        }
      }
      throw error;
    }
  };

const updateMemberStatusPaymentByAdmin = async (req: Request):
  Promise<IGroupBotramMember['_id'] | Error> => {
    const { botramId, memberId } = req.params;
    if (!botramId) {
      throw new BadRequest('Invalid request. botramId param is missing.');
    }
    if (!memberId) {
      throw new BadRequest('Invalid request. memberId param is missing.');
    }

    try {
      const foundMemberToBeUpdated = await GroupBotramMember.findOne({
        _id: memberId,
        groupBotramId: botramId,
        status: 'orderready',
      });
      if (!foundMemberToBeUpdated) {
        throw new NotFound('Member of botram group is not found.');
      }

      const memberOrderInBotramGroup =
        await GroupBotramMemberOrder.findOne({ groupBotramMemberId: foundMemberToBeUpdated._id });
      if (!memberOrderInBotramGroup) {
        throw new NotFound('Member order to update is not found.');
      }

      await Order.findOneAndUpdate(
        { _id: memberOrderInBotramGroup.orderId, isGroup: true, isPaid: false },
        { isPaid: true },
      );

      const result = foundMemberToBeUpdated._id;
      return result;
    } catch (error: any) {
      throw error;
    }
  };

const updateGroupBotramStatusToAllReadyOrder = async (req: Request):
  Promise<IGroupBotram['_id'] | Error> => {
    const { botramId } = req.params;
    if (!botramId) {
      throw new BadRequest('botramId param is missing.');
    }
    const { status } = req.body;
    if (!status || (status !== 'allreadyorder')) {
      throw new BadRequest('Status \'allreadyorder\' wajib diisi.');
    }
    try {
      const memberList = await GroupBotramMember.find({ groupBotramId: botramId });
      let totalBotramGroupOrder = 0;
      memberList.map(async (member) => {
        const memberOrder = await GroupBotramMemberOrder.findOne({ groupBotramMemberId: member._id })
          .populate({
            path: 'orderId',
            select: 'total',
          });
        if (!memberOrder) {
          await GroupBotramMember.findByIdAndUpdate(member._id, { status: 'expelled' });
        }
        const orderedMenus = await OrderedMenu.find({ orderId: memberOrder!.orderId })
          .populate({
            path: 'menuId',
            select: 'stock price',
          });
        orderedMenus.map(async (orderedMenu) => {
          if (!orderedMenu.menuId) {
            throw new BadRequest('Menu yang dipilih sudah dihapus.');
          }
          if (orderedMenu.quantity > (orderedMenu.menuId as IMenu).stock) {
            throw new BadRequest('Terdapat order menu yang melebihi stock.');
          }
          totalBotramGroupOrder += orderedMenu.quantity * (orderedMenu.menuId as IMenu).price;
        });
      });
      const updatedGroupBotramStatus = await GroupBotram.findByIdAndUpdate(
        botramId,
        { status: 'allorderready' },
      );
      if (!updatedGroupBotramStatus) {
        throw new NotFound('Botram group is not found.');
      }
      await GroupBotramOrder.create({
        groupBotramId: botramId,
        restaurantId: updatedGroupBotramStatus!.restaurantId,
        totalAmount: totalBotramGroupOrder,
      });
      return updatedGroupBotramStatus._id;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Botram group is not found.');
      }
      throw error;
    }
  }

export {
  getAllCustomerBotramGroup,
  findCustomerToBeAddedToBotramGroup,
  createBotramGroup,
  getSpecificCustomerBotramGroup,
  joinOpenMemberBotramGroup,
  exitFromBotramGroupForMemberOnly,
  kickMemberBotramGroupByAdmin,
  updateMemberStatusPaymentByAdmin,
  updateGroupBotramStatusToAllReadyOrder,
};

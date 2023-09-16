import { Request } from 'express';
import * as DTO from './types';
import { BotramGroup, BotramGroupMember, BotramGroupMemberStatus, BotramGroupOrderStatus, Customer } from '@prisma/client';
import prisma from '../../../../db';
import { BadRequest, NotFound, Unauthorized } from '../../../../errors';

const getAllCustomerBotramGroup = async (
  req: Request
): Promise<DTO.GetAllCustomerBotramGroupResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

  const joinedBotramGroups = await prisma.botramGroupMember.findMany({
    where: {
      customerId,
      OR: [
        { status: 'ORDERING' },
        { status: 'ORDER_READY' },
      ],
    },
    include: {
      botramGroup: {
        include: {
          creatorCustomer: {
            select: { id: true },
          },
          restaurant: {
            select: { id: true, username: true, name: true },
          },
        },
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
  });

  const result: DTO.GetAllCustomerBotramGroupResponse = joinedBotramGroups
    .filter((joinedBotramGroup) => joinedBotramGroup.botramGroup !== null)
    .map((joinedBotramGroup) => ({
      id: joinedBotramGroup.botramGroup.id,
      createdAt: joinedBotramGroup.botramGroup.createdAt,
      name: joinedBotramGroup.botramGroup.name,
      restaurant: {
        id: joinedBotramGroup.botramGroup.restaurant.id,
        username: joinedBotramGroup.botramGroup.restaurant.username,
        name: joinedBotramGroup.botramGroup.restaurant.name,
      },
      status: joinedBotramGroup.botramGroup.status,
      memberStatus: joinedBotramGroup.botramGroup.creatorCustomerId.toString()
          === customerId.toString() ? 'admin' : 'member',
    }));

  return result;
};

const findCustomerToBeAddedToBotramGroup = async (
  req: Request
): Promise<DTO.FindCustomerResponse | Error> => {
  const { customerUsername } = req.params;

  const foundCustomer = await prisma.customer.findUnique({
    where: { username: customerUsername },
  });
  if (!foundCustomer) {
    throw new NotFound('Customer is not found.');
  }

  const result: DTO.FindCustomerResponse = {
    id: foundCustomer.id,
    username: foundCustomer.username,
    name: foundCustomer.name,
    avatar: foundCustomer.avatar,
  };
  return result;
};

const createBotramGroup = async (
  req: Request
): Promise<BotramGroup['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const body: DTO.CreateBotramGroupBody =
    DTO.createBotramGroupBodySchema.parse(req.body);

  const customerIsJoiningActiveBotramGroup = await prisma.botramGroupMember.findFirst({
    where: { customerId, status: 'ORDERING'},
  });
  if (customerIsJoiningActiveBotramGroup) {
    throw new Unauthorized('Cannot create botram group. Customer is ordering in active botram group.');
  }

  const customerDetail = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  const restaurantDetail = await prisma.restaurant.findUnique({
    where: { id: body.restaurantId },
  });
  if (!restaurantDetail) {
    throw new NotFound('Restaurant is not found.');
  }

  return await prisma.$transaction(async (tx) => {
    const createdBotramGroup = await tx.botramGroup.create({
      data: {
        creatorCustomerId: customerId,
        restaurantId: body.restaurantId,
        name: body.name,
      },
    });
    await Promise.all(body.members.map(async (member) => {
      const invitedCustomerExist = await tx.customer.findUnique({
        where: { id: member.id },
      });
      if (!invitedCustomerExist) {
        throw new NotFound('Customer is not found.');
      }
      if (invitedCustomerExist.joinBotram === 'BYSELF') {
        return;
      }
      let statusJoinGroupBotram: BotramGroupMemberStatus;
      if (invitedCustomerExist.joinBotram === 'DIRECTLY') {
        statusJoinGroupBotram = 'ORDERING';
        await tx.customerNotification.create({
          data: {
            customerId: invitedCustomerExist.id,
            title: 'Join Botram',
            description: `${customerDetail!.username} memasukkan mu ke dalam group botram ${body.name} di ${restaurantDetail.name}. Yuk gercep pilih menu menu nya!`,
            redirectLink: 'ngacodulu',
          },
        });
      } else {
        await tx.botramGroupInvitation.create({
          data: {
            botramGroupId: createdBotramGroup.id,
            customerId: invitedCustomerExist.id,
          },
        });
        statusJoinGroupBotram = 'NOT_JOIN_YET';
        await tx.customerNotification.create({
          data: {
            customerId: invitedCustomerExist.id,
            title: 'Undangan Botram',
            description: `${customerDetail!.username} mengajak mu untuk makan bersama di group botram ${body.name} di ${restaurantDetail.name}, kamu bisa terima ajakannya atau terserah kamu deh.`,
            redirectLink: 'ngacodulu',
          },
        });
      }
      await tx.botramGroupMember.create({
        data: {
          botramGroupId: createdBotramGroup.id,
          customerId: invitedCustomerExist.id,
          status: statusJoinGroupBotram,
        },
      });
    }));
    await tx.botramGroupMember.create({
      data: {
        botramGroupId: createdBotramGroup.id,
        customerId,
        status: 'ORDERING',
      },
    });
    return createdBotramGroup.id;
  });
};

const getSpecificCustomerBotramGroup = async (
  req: Request
): Promise<DTO.BotramResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { botramId } = req.params;
  const botramGroup = await prisma.botramGroup.findUnique({
    where: { id: botramId },
    include: {
      restaurant: true,
      creatorCustomer: true,
    }
  });
  if (!botramGroup) {
    throw new NotFound('Botram group is not found.');
  }

  const memberCount = await prisma.botramGroupMember.count({
    where: {
      botramGroupId: botramId,
      OR: [
        { status: 'ORDERING'},
        { status: 'ORDER_READY' },
      ],
    },
  });

  const result: DTO.BotramResponse = {
    id: botramGroup.id,
    createdAt: botramGroup.createdAt,
    name: botramGroup.name,
    restaurant: {
      id: botramGroup.restaurantId,
      username: botramGroup.restaurant.username,
      name: botramGroup.restaurant.name,
    },
    admin: {
      username: botramGroup.creatorCustomer.username,
      name: botramGroup.creatorCustomer.name,
    },
    status: botramGroup.status,
    memberCount,
  };

  const customerIsMember = await prisma.botramGroupMember.findFirst({
    where: {
      customerId,
      botramGroupId: botramId, 
      OR: [
        { status: 'ORDERING'},
        { status: 'ORDER_READY' },
      ],
    },
  });
  if (!customerIsMember) {
    const customerIsInvited = await prisma.botramGroupInvitation.findFirst({
      where: { botramGroupId: botramId, customerId },
    });
    if (botramGroup.openMembership || customerIsInvited) {
      result.status = 'REVIEW';
      return result;
    } else {
      throw new Unauthorized('Customer is not part of member. Access to this resource is forbidden.');
    }
  }

  return result;
};

const joinOpenMemberBotramGroup = async (
  req: Request
): Promise<BotramGroupMember['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { botramId } = req.params;
  if (!botramId) {
    throw new BadRequest('botramId param is missing.');
  }
  const customerIsJoiningActiveBotramGroup = await prisma.botramGroupMember.findFirst({
    where: { customerId, status: 'ORDERING'},
  });
  if (customerIsJoiningActiveBotramGroup) {
    throw new Unauthorized('Cannot join botram group. Customer is ordering in active botram group.');
  }

  const botramGroup = await prisma.botramGroup.findUnique({
    where: { id: botramId, openMembership: true },
  });

  if (!botramGroup) {
    throw new NotFound('Botram group is not found.');
  }

  const becomingMemberBotramGroup = await prisma.botramGroupMember.create({
    data: { botramGroupId: botramId, customerId, status: 'ORDERING' },
  });

  return becomingMemberBotramGroup.id;
};

const exitFromBotramGroupForMemberOnly = async (
  req: Request
): Promise<BotramGroupMember['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { botramId } = req.params;
  if (!botramId) {
    throw new BadRequest('botramId param is missing.');
  }

  const botramGroupHasOrder = await prisma.botramGroupOrder.findUnique({
    where: { botramGroupId: botramId },
  });
  if (botramGroupHasOrder) {
    throw new BadRequest('Invalid request. Botram group order already processed. Member can not exit.');
  }

  const foundBotramGroupMember = await prisma.botramGroupMember.findFirst({
    where: {
      customerId,
      botramGroupId: botramId,
    },
  });
  const exitBotramGroup = await prisma.botramGroupMember.update({
    where: {
      id: foundBotramGroupMember?.id,
      botramGroupId: botramId,
      customerId,
      OR: [ { status: 'ORDERING' }, { status: 'ORDER_READY' } ],
    },
    data: { status: 'EXIT' },
  });
  if (!exitBotramGroup) {
    throw new NotFound('Botram group is not found.');
  }

  return exitBotramGroup.id;
};

const getMemberAndMemberOrderOfBotramGroup = async (
  req: Request
): Promise<DTO.GetMemberAndMemberOrderBotramGroup | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { botramId } = req.params;
  if (!botramId) {
    throw new BadRequest('botramId param is missing.');
  }

  const foundBotramGroup = await prisma.botramGroup.findUnique({
    where: { id: botramId },
  });
  if (!foundBotramGroup) {
    throw new NotFound('Botram group is not found.');
  }

  const myOrder = await prisma.botramGroupMember.findFirst({
    where: { botramGroupId: botramId, customerId },
    include: {
      memberOrder: {
        include: {
          order: {
            include: {
              orderedMenus: {
                include: {
                  orderedMenuSpicyLevel: {
                    select: {
                      level: true,
                    }
                  },
                },
                select: {
                  id: true,
                  quantity: true,
                  totalPrice: true,
                  isDibungkus: true,
                },
              },
              orderedCustomMenus: {
                include: {
                  customMenu: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                    }
                  },
                  orderedCustomMenuSpicyLevel: {
                    select: {
                      level: true,
                    }
                  },
                }
              },
            },
            select: {
              id: true,
              total: true,
              isPaid: true,
            },
          },
        },
      },
      customer: {
        select: {
          username: true,
          name: true,
        },
      },
    },
  });

  if (!myOrder) {
    throw new NotFound('Botram group is not found.');
  }

  const otherMemberAndMemberOrderBotramGroup = await prisma.botramGroupMember.findMany({
    where: {
      botramGroupId: botramId,
      customerId: { not: customerId },
    },
    include: {
      memberOrder: {
        include: {
          order: {
            include: {
              orderedMenus: {
                include: {
                  menu: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                    }
                  },
                  orderedMenuSpicyLevel: {
                    select: {
                      level: true,
                    }
                  },
                },
                select: {
                  id: true,
                  quantity: true,
                  totalPrice: true,
                  isDibungkus: true,
                },
              },
              orderedCustomMenus: {
                include: {
                  customMenu: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                    }
                  },
                  orderedCustomMenuSpicyLevel: {
                    select: {
                      level: true,
                    }
                  },
                }
              },
            },
            select: {
              id: true,
              total: true,
              isPaid: true,
            },
          },
        },
      },
      customer: {
        select: {
          username: true,
          name: true,
        },
      },
    },
  });

  const result: DTO.GetMemberAndMemberOrderBotramGroup = {
    botramGroupId: botramId,
    myOrder: {
      memberDetail: {
        id: myOrder?.id,
        status: myOrder.status,
        username: myOrder.customer.username,
        name: myOrder.customer.name,
      },
      order: {
        id: myOrder.memberOrder?.orderId ?? null,
        isPaid: myOrder.memberOrder?.order.isPaid ?? null,
        total: myOrder.memberOrder?.order.total ?? null,
        orderedMenus: myOrder.memberOrder?.order.orderedMenus.map((orderedMenu) => ({
          id: orderedMenu.id,
          isDibungkus: orderedMenu.isDibungkus,
          menu: {
            id: orderedMenu.menuId,
            name: orderedMenu.menuName,
            price: orderedMenu.menuPrice,
          },
          quantity: orderedMenu.quantity,
          totalPrice: orderedMenu.totalPrice,
          spicyLevel: orderedMenu.orderedMenuSpicyLevel?.level ?? null,
        })) ?? [],
        orderedCustomMenus: myOrder.memberOrder?.order.orderedCustomMenus.map((orderedCustomMenu) => ({
          id: orderedCustomMenu.id,
          isDibungkus: orderedCustomMenu.isDibungkus,
          customMenu: {
            id: orderedCustomMenu.customMenuId,
            name: orderedCustomMenu.customMenuName,
            price: orderedCustomMenu.customMenuPrice,
          },
          quantity: orderedCustomMenu.quantity,
          totalPrice: orderedCustomMenu.totalPrice,
          spicyLevel: orderedCustomMenu.orderedCustomMenuSpicyLevel?.level ?? null,
        })) ?? [],
      },
    },
    members: otherMemberAndMemberOrderBotramGroup.map((memberOrder) => ({
      memberDetail: {
        id: memberOrder.id,
        status: memberOrder.status,
        username: memberOrder.customer.username,
        name: memberOrder.customer.name,
      },
      order: {
        id: memberOrder.memberOrder?.orderId ?? null,
        isPaid: memberOrder.memberOrder?.order.isPaid ?? null,
        total: memberOrder.memberOrder?.order.total ?? null,
        orderedMenus: memberOrder.memberOrder?.order.orderedMenus.map((orderedMenu) => ({
          id: orderedMenu.id,
          isDibungkus: orderedMenu.isDibungkus,
          menu: {
            id: orderedMenu.menuId,
            name: orderedMenu.menuName,
            price: orderedMenu.menuPrice,
          },
          quantity: orderedMenu.quantity,
          totalPrice: orderedMenu.totalPrice,
          spicyLevel: orderedMenu.orderedMenuSpicyLevel?.level ?? null,
        })) ?? [],
        orderedCustomMenus: memberOrder.memberOrder?.order.orderedCustomMenus.map((orderedCustomMenu) => ({
          id: orderedCustomMenu.id,
          isDibungkus: orderedCustomMenu.isDibungkus,
          customMenu: {
            id: orderedCustomMenu.customMenuId,
            name: orderedCustomMenu.customMenuName,
            price: orderedCustomMenu.customMenuPrice,
          },
          quantity: orderedCustomMenu.quantity,
          totalPrice: orderedCustomMenu.totalPrice,
          spicyLevel: orderedCustomMenu.orderedCustomMenuSpicyLevel?.level ?? null,
        })) ?? [],
      }
    })),
  };
  return result;
};

const kickMemberBotramGroupByAdmin = async (
  req: Request
): Promise<BotramGroupMember['id'] | Error> => {
  const { botramId, memberId } = req.params;
  if (!botramId) {
    throw new BadRequest('botramId param is missing.');
  }
  if (!memberId) {
    throw new BadRequest('memberId param is missing.');
  }

  const foundBotramGroup = await prisma.botramGroup.findUnique({
    where: { id: botramId },
    include: { creatorCustomer: true },
  });
  if (!foundBotramGroup) {
    throw new NotFound('Botram group is not found.');
  }
  if (foundBotramGroup.status !== 'ORDERING') {
    throw new BadRequest('Botram group is not ordering. Member can not be expelled.');
  };

  const foundBotramGroupMember = await prisma.botramGroupMember.findUnique({
    where: { id: memberId },
  });
  if (!foundBotramGroupMember) {
    throw new NotFound('Member is not found.');
  }
  const kickedMember = await prisma.botramGroupMember.update({
    where: { id: foundBotramGroupMember.id, customerId: memberId, botramGroupId: botramId },
    data: { status: 'EXPELLED'},
  });
  await prisma.customerNotification.create({
    data: {
      customerId: kickedMember.customerId,
      title: 'Kamu Dikeluarkan Dari Grup Botram',
      description: `Admin ${foundBotramGroup.creatorCustomer.name} telah mengeluarkanmu dari ${foundBotramGroup.name} botram group.`,
    },
  });

  return kickedMember.id;
};

const updateMemberStatusPaymentByAdmin = async (
  req: Request
): Promise<BotramGroupMember['id'] | Error> => {
  const { botramId, memberId } = req.params;
  if (!botramId) {
    throw new BadRequest('botramId param is missing.');
  }
  if (!memberId) {
    throw new BadRequest('memberId param is missing.');
  }

  const foundMemberToBeUpdated = await prisma.botramGroupMember.findUnique({
    where: { id: memberId, botramGroupId: botramId, status: 'ORDER_READY' },
    include: {
      botramGroup: {
        include: {
          creatorCustomer: true,
        }
      }
    }
  });
  if (!foundMemberToBeUpdated) {
    throw new NotFound('Member of botram group is not found.');
  }

  const memberOrderInBotramGroup = await prisma.botramGroupMemberOrder.findUnique({
    where: { botramGroupMemberId: foundMemberToBeUpdated.id },
  });
  if (!memberOrderInBotramGroup) {
    throw new NotFound('Member order to update is not found.');
  }
  await prisma.order.update({
    where: {
      id: memberOrderInBotramGroup.id,
      isGroup: true,
      isPaid: false,
    },
    data: {
      isPaid: true,
    },
  });
  await prisma.customerNotification.create({
    data: {
      customerId: foundMemberToBeUpdated.customerId,
      title: 'Pesanan Botrammu Telah Dibayar',
      description: `Admin ${foundMemberToBeUpdated.botramGroup.creatorCustomer.name} dari ${foundMemberToBeUpdated.botramGroup.name} mengubah status pembayaran pesananmu di ${foundMemberToBeUpdated.botramGroup.name}`,
      redirectLink: 'ngacoheulateusih',
    },
  });

  const result = foundMemberToBeUpdated.id;
  return result;
};

const updateGroupBotramStatusToAllReadyOrder = async (
  req: Request
): Promise<BotramGroup['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { botramId } = req.params;
  if (!botramId) {
    throw new BadRequest('Invalid request. botramId param is missing.');
  }

  const foundBotramGroup = await prisma.botramGroup.findUnique({
    where: { id: botramId, creatorCustomerId: customerId },
    include: {
      creatorCustomer: true,
      members: true,
    },
  });
  if (!foundBotramGroup) {
    throw new NotFound('Botram group is not found.');
  }

  foundBotramGroup.members
  .filter((member) => member.status === 'ORDERING')
  .map(async (member) => {
    await prisma.customerNotification.create({
      data: {
        customerId: member.customerId,
        title: 'Kamu Belum Pesan Apa-Apa',
        description: `Kamu belum pesan apa-apa di grup botram ${foundBotramGroup.name} sedangkan anggota yang lain telah sepakat untuk memesan. Kamu secara otomatis bukan merupakan anggota dari grup botram ${foundBotramGroup.name}.`,
      },
    });
  });
  await prisma.botramGroupMember.updateMany({
    where: { botramGroupId: foundBotramGroup.id, status: 'ORDERING'},
    data: { status: 'EXPELLED' },
  });
  await prisma.botramGroup.update({
    where: { id: foundBotramGroup.id },
    data: { openMembership: false, status: 'ALL_READY_ORDER', },
  });
  foundBotramGroup.members
    .filter((member) => member.status === 'ORDER_READY')
    .map(async (member) => {
      await prisma.customerNotification.create({
        data: {
          customerId: member.customerId,
          title: 'Pesanan Botram Siap Dipesankan',
          description: `Admin ${foundBotramGroup.creatorCustomer.name} dari ${foundBotramGroup.name} mengubah status pesanan botram group agar siap diproses restaurant.`,
          redirectLink: 'ngacoheula',
        },
      });
    });
  await prisma.botramGroupInvitation.updateMany({
    where: { botramGroupId: foundBotramGroup.id, isActive: true },
    data: { isActive: false },
  });

  return foundBotramGroup.id;
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

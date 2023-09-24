import { Request } from 'express';

import { Customer, Order, OrderStatus } from '@prisma/client';
import * as DTO from './types';
import prisma from '../../../../db';
import { BadRequest, NotFound } from '../../../../errors';
import { findQueueNumberOrder } from '../../../../utils';

const createOrder = async (
  req: Request
): Promise<Order['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

  const body: DTO.CreateOrderBodyRequest =
    DTO.createOrderBodyRequestSchema.parse(req.body);

  const foundRestaurant = await prisma.restaurant.findUnique({
    where: { id: body.restaurantId },
  });
  if (!foundRestaurant) {
    throw new NotFound('Restaurant is not found.');
  }

  return await prisma.$transaction(async (tx) => {
    let orderedMenuList: DTO.OrderedMenuPayload[] = [];
    if (body.orderedItemList.menu.length > 0) {
      body.orderedItemList.menu.map(async (selectedMenu) => {
        const foundMenu = await tx.menu.findUnique({
          where: { id: selectedMenu.id },
        });
        if (!foundMenu) {
          throw new NotFound('Menu is not found.');
        }
        if (selectedMenu.quantity > foundMenu.stock) {
          throw new BadRequest('Item is run out of stock. Please try again later.');
        }
        const orderedMenuPayload: DTO.OrderedMenuPayload = {
          orderedMenu: {
            menuId: foundMenu.id,
            menuName: foundMenu.name,
            menuPrice: foundMenu.price,
            isDibungkus: selectedMenu.isDibungkus,
            quantity: selectedMenu.quantity,
            totalPrice: foundMenu.price * selectedMenu.quantity,
          },
          orderedMenuSpicyLevel: selectedMenu.spicyLevel ?? null,
        };
        orderedMenuList.push(orderedMenuPayload);
      });
    }

    let orderedCustomMenuList: DTO.OrderedCustomMenuPayload[] = [];
    if (body.orderedItemList.customMenu.length > 0) {
      body.orderedItemList.customMenu.map(async (selectedCustomMenu) => {
        const foundCustomMenu = await tx.customMenu.findUnique({
          where: { id: selectedCustomMenu.id },
          include: {
            pickedCustomMenuCompositions: {
              include: {
                customMenuComposition: true,
              },
            },
          },
        });
        if (!foundCustomMenu) {
          throw new NotFound('Custom menu is not found.');
        }
        foundCustomMenu.pickedCustomMenuCompositions.map((pickedComposition) => {
          const compareStock = pickedComposition.qty * selectedCustomMenu.quantity;
          if (compareStock > pickedComposition.customMenuComposition.stock) {
            throw new BadRequest('Item is run out of stock. Please try again later.');
          }
        });

        const orderedCustomMenuPayload: DTO.OrderedCustomMenuPayload = {
          orderedCustomMenu: {
            customMenuId: foundCustomMenu.id,
            customMenuName: foundCustomMenu.name,
            customMenuPrice: foundCustomMenu.price,
            isDibungkus: selectedCustomMenu.isDibungkus,
            quantity: selectedCustomMenu.quantity,
            totalPrice: (selectedCustomMenu.quantity * foundCustomMenu.price),
          },
          orderedCustomMenuSpicyLevel: selectedCustomMenu.spicyLevel ?? null,
        };
        orderedCustomMenuList.push(orderedCustomMenuPayload);
      });
    }

    let totalOrder = 0;
    orderedMenuList.map((item) => {
      totalOrder += item.orderedMenu.totalPrice;
    });
    orderedCustomMenuList.map((item) => {
      totalOrder += item.orderedCustomMenu.totalPrice;
    });

    const createdOrder = await tx.order.create({
      data: {
        customerId,
        restaurantId: body.restaurantId,
        total: totalOrder,
      },
    });
    if (orderedMenuList.length > 0) {
      orderedMenuList.map(async (item) => {
        const createdOrderedMenu = await tx.orderedMenu.create({
          data: {
            orderId: createdOrder.id,
            menuId: item.orderedMenu.menuId,
            menuName: item.orderedMenu.menuName,
            menuPrice: item.orderedMenu.menuPrice,
            quantity: item.orderedMenu.quantity,
            totalPrice: item.orderedMenu.totalPrice,
            isDibungkus: item.orderedMenu.isDibungkus,
          },
        });
        if (item.orderedMenuSpicyLevel) {
          await tx.orderedMenuSpicyLevel.create({
            data: {
              orderedMenuId: createdOrderedMenu.id,
              level: item.orderedMenuSpicyLevel,
            }
          });
        }
      });
    }
    if (orderedCustomMenuList.length > 0) {
      orderedCustomMenuList.map(async (item) => {
        const createdOrderedCustomMenu = await tx.orderedCustomMenu.create({
          data: {
            orderId: createdOrder.id,
            customMenuId: item.orderedCustomMenu.customMenuId,
            customMenuName: item.orderedCustomMenu.customMenuName,
            customMenuPrice: item.orderedCustomMenu.customMenuPrice,
            isDibungkus: item.orderedCustomMenu.isDibungkus,
            quantity: item.orderedCustomMenu.quantity,
            totalPrice: item.orderedCustomMenu.totalPrice,
          },
        });

        if (item.orderedCustomMenuSpicyLevel) {
          await tx.orderedCustomMenuSpicyLevel.create({
            data: {
              orderedCustomMenuId: createdOrderedCustomMenu.id,
              level: item.orderedCustomMenuSpicyLevel,
            },
          });
        }
      });
    }
    return createdOrder.id;
  });
};

const getOrderList = async (
  req: Request
): Promise<DTO.GetOrderListResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

  const orders = await prisma.order.findMany({
    where: { customerId, status: { not: 'ACCEPTED_BY_CUSTOMER' } },
    include: {
      restaurant: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
      botramGroupMemberOrder: {
        include: {
          botramGroupMember: {
            include: {
              botramGroup: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const result: DTO.GetOrderListResponse = orders.map((order) => {
    const orderItem: DTO.OrderNotBotramItem = {
      id: order.id,
      createdAt: order.createdAt,
      isGroup: order.isGroup,
      restaurant: {
        id: order.restaurantId,
        username: order.restaurant.username,
        name: order.restaurant.name,
      },
      isPaid: order.isPaid,
      status: order.status as Exclude<OrderStatus, 'ACCEPTED_BY_CUSTOMER'>,
      total: order.total,
      queueNumber: order.status === 'ACCEPTED_BY_RESTO'
        ? (async () => await findQueueNumberOrder({ restaurantId: order.restaurantId, customerId }))()
        : null,
    };
    if (order.isGroup) {
      (orderItem as DTO.OrderBotramItem).botramGroup = {
        id: order.botramGroupMemberOrder!.botramGroupMember.botramGroupId,
        name: order.botramGroupMemberOrder!.botramGroupMember.botramGroup.name,
      };
    }
    return orderItem;
  });
  return result;
};

const getOrderById = async (
  req: Request
): Promise<DTO.GetOrderByIdResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { orderId } = req.params;

  const foundOrder = await prisma.order.findUnique({
    where: { id: orderId, customerId },
    include: {
      restaurant: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
      botramGroupMemberOrder: {
        include: {
          botramGroupMember: {
            include: {
              botramGroup: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      orderedMenus: {
        include: {
          orderedMenuSpicyLevel: true,
        },
      },
      orderedCustomMenus: {
        include: {
          orderedCustomMenuSpicyLevel: true,
        },
      },
    },
  });
  if (!foundOrder) {
    throw new NotFound('Order is not found.');
  }

  const result: DTO.OrderNotBotramDetail = {
    id: foundOrder.id,
    createdAt: foundOrder.createdAt,
    isGroup: foundOrder.isGroup,
    restaurant: {
      id: foundOrder.restaurantId,
      username: foundOrder.restaurant.username,
      name: foundOrder.restaurant.name,
    },
    total: foundOrder.total,
    status: foundOrder.status,
    isPaid: foundOrder.isPaid,
    queueNumber: foundOrder.status === 'ACCEPTED_BY_RESTO'
      ? (async () => await findQueueNumberOrder({ restaurantId: foundOrder.restaurantId, customerId }))()
      : null,
    orderedMenu: foundOrder.orderedMenus.map((orderedMenu) => ({
      id: orderedMenu.id,
      menu: {
        id: orderedMenu.menuId,
        name: orderedMenu.menuName,
        price: orderedMenu.menuPrice,
      },
      quantity: orderedMenu.quantity,
      isDibungkus: orderedMenu.isDibungkus,
      totalPrice: orderedMenu.totalPrice,
      spicyLevel: orderedMenu.orderedMenuSpicyLevel?.level ?? null,
    })),
    orderedCustomMenu: foundOrder.orderedCustomMenus.map((orderedCustomMenu) => ({
      id: orderedCustomMenu.id,
      customMenu: {
        id: orderedCustomMenu.customMenuId,
        name: orderedCustomMenu.customMenuName,
        price: orderedCustomMenu.customMenuPrice,
      },
      quantity: orderedCustomMenu.quantity,
      isDibungkus: orderedCustomMenu.isDibungkus,
      totalPrice: orderedCustomMenu.totalPrice,
      spicyLevel: orderedCustomMenu.orderedCustomMenuSpicyLevel?.level ?? null,
    })),
  };

  if (foundOrder.isGroup) {
    (result as DTO.OrderBotramDetail).botramGroup = {
      id: foundOrder.botramGroupMemberOrder!.botramGroupMember.botramGroupId,
      name: foundOrder.botramGroupMemberOrder!.botramGroupMember.botramGroup.name,
    };
  }

  return result;
};

const deleteUnprocessedOrder = async (
  req: Request
): Promise<Order['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { orderId } = req.params;
  if (!orderId) {
    throw new BadRequest('orderId param is missing.');
  }

  const deletedOrder = await prisma.order.delete({
    where: { id: orderId, customerId, status: 'READY_TO_ORDER' },
  });

  if (!deletedOrder) {
    throw new NotFound('Order is not found.');
  }

  return deletedOrder.id;
};

export {
  createOrder,
  getOrderList,
  getOrderById,
  deleteUnprocessedOrder,
};

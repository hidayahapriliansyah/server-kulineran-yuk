import { Request } from 'express';
import dayjs from 'dayjs';

import prisma from '../../../../db';
import { BotramGroupMember, Order, OrderStatus, OrderedCustomMenu, OrderedCustomMenuSpicyLevel, OrderedMenu, OrderedMenuSpicyLevel, Prisma, PrismaClient, Restaurant } from '@prisma/client';
import { BadRequest, NotFound } from '../../../../errors';
import * as DTO from './types';

const orderedMenusMapping = (
  orderedMenus: DTO.OrderedMenuWithSpicyLevel[] | [],
): DTO.OrderedMenuDetailResponse[] | [] => {
  return orderedMenus.map((orderedMenu) => ({
    id: orderedMenu.id,
    isDibungkus: orderedMenu.isDibungkus,
    menuId: orderedMenu.menuId,
    menuName: orderedMenu.menuName,
    menuPrice: orderedMenu.menuPrice,
    quantity: orderedMenu.quantity,
    totalPrice: orderedMenu.totalPrice,
    spicyLevel: orderedMenu.orderedMenuSpicyLevel?.level ?? null,
  }));
};

const orderedCustomMenusMapping = (
  orderedCustomMenus: DTO.OrderedCustomMenuWithSpicyLevel[] | [],
): DTO.OrderedCustomMenuDetailResponse[] | [] => {
  return orderedCustomMenus.map((orderedCustomMenu) => ({
    id: orderedCustomMenu.id,
    isDibungkus: orderedCustomMenu.isDibungkus,
    customMenuId: orderedCustomMenu.customMenuId,
    customMenuName: orderedCustomMenu.customMenuName,
    customMenuPrice: orderedCustomMenu.customMenuPrice,
    quantity: orderedCustomMenu.quantity,
    totalPrice: orderedCustomMenu.totalPrice,
    spicyLevel: orderedCustomMenu.orderedCustomMenuSpicyLevel?.level ?? null,
  }));
};

const getCountOrder = async (req: Request):
  Promise<DTO.GetCountOrderResponse | Error> => {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;

    const orders = await prisma.order.findMany({
      where: { restaurantId, status: { notIn: ['READY_TO_ORDER', 'ACCEPTED_BY_CUSTOMER'] } },
    });

    const acceptedByRestoOrder = orders.filter((order) => order.status === 'ACCEPTED_BY_RESTO');
    const processedByRestoOrder = orders.filter((order) => order.status === 'PROCESSED_BY_RESTO');
    const doneByRestoOrder = orders.filter((order) => order.status === 'DONE_BY_RESTO');
    const canceledByRestoOrder = orders.filter((order) => order.status === 'CANCEL_BY_RESTO');
    
    const result: DTO.GetCountOrderResponse = {
      accepted: acceptedByRestoOrder.length,
      processed: processedByRestoOrder.length,
      done: doneByRestoOrder.length,
      cancel: canceledByRestoOrder.length,
      total: acceptedByRestoOrder.length + processedByRestoOrder.length
        + doneByRestoOrder.length + canceledByRestoOrder.length,
    };
    return result;
  };

const getTodayOrder = async (req: Request):
  Promise<DTO.GetTodayOrderResponse | Error> => {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;

    const { status, page = '1' } = req.query as {
      status?: OrderStatus | 'BOTRAM',
      page?: string,
    };

    let filter: Prisma.OrderWhereInput = {
      status: { notIn: ['READY_TO_ORDER', 'ACCEPTED_BY_CUSTOMER'] },
    };

    const numberedLimit = 10;
    const numberedPage = Number(page);
    if (isNaN(numberedPage)) {
      throw new BadRequest('Invalid Request. page query is not number.');
    }

    if (status && status === 'BOTRAM') {
      const todayBotramOrders = await prisma.botramGroupOrder.findMany({
        where: { restaurantId, status: { notIn: ['READY_TO_ORDER', 'ACCEPTED_BY_CUSTOMER'] }, },
        include: {
          botramGroup: {
            include: {
              creatorCustomer: {
                select: {
                  username: true,
                  name: true,
                  avatar: true,
                },
              }
            },
          },
        },
        take: numberedLimit,
        skip: numberedLimit * (numberedPage - 1),
      });

      const countTodayBotramOrders = await prisma.botramGroupOrder.count({
        where: { restaurantId, status: { notIn: ['READY_TO_ORDER', 'ACCEPTED_BY_CUSTOMER'] }, },
      });
      const totalPages = Math.ceil(countTodayBotramOrders / numberedLimit);
      const todayBotramOrdersMapped: DTO.BotramGroupOrderItem[] = todayBotramOrders.map((botramOrder) => ({
        id: botramOrder.id,
        createdAt: botramOrder.createdAt,
        botramGroup: {
          name: botramOrder.botramGroup.name,
          admin: {
            username: botramOrder.botramGroup.creatorCustomer.username,
            name: botramOrder.botramGroup.creatorCustomer.name,
            image: botramOrder.botramGroup.creatorCustomer.avatar,
          },
        },
        isPaid: botramOrder.isPaid,
        status: botramOrder.status,
        total: botramOrder.totalAmount,
      }));

      const result: DTO.GetTodayOrderResponse = {
        orders: todayBotramOrdersMapped,
        total: countTodayBotramOrders,
        pages: totalPages,
      }
      return result;
    }

    if (status) {
      filter = { status };
    }

    const todayCustomerOrders = await prisma.order.findMany({
      where: { restaurantId, ...filter },
      include: {
        customer: {
          select: {
            username: true,
            name: true,
            avatar: true,
          },
        },
        botramGroupMemberOrder: {
          include: {
            botramGroupMember: {
              include: {
                botramGroup: true,
              },
            },
          },
        },
      },
      take: numberedLimit,
      skip: numberedLimit * (numberedPage - 1),
    });

    const countTodayCustomerOrders = await prisma.order.count({
      where: { restaurantId, ...filter },
    });
    const totalPages = Math.ceil(countTodayCustomerOrders / numberedLimit);
    const todayCustomerOrdersMapped: (DTO.CustomerOrderBotramItem | DTO.CustomerOrderNotBotramItem)[] | [] =
      todayCustomerOrders.map((order) => {
        const orderItem: DTO.CustomerOrderNotBotramItem = {
          id: order.id,
          createdAt: order.createdAt,
          isGroup: order.isGroup,
          customer: {
            username: order.customer.username,
            name: order.customer.name,
            image: order.customer.avatar,
          },
          isPaid: order.isPaid,
          status: order.status,
          total: order.total,
        };
        if (order.isGroup) {
          (orderItem as DTO.CustomerOrderBotramItem).botramGroup = {
            id: order.botramGroupMemberOrder!.botramGroupMember.botramGroupId,
            name: order.botramGroupMemberOrder!.botramGroupMember.botramGroup.name,
          };
        }
        return orderItem;
      });

    const result: DTO.GetTodayOrderResponse = {
      orders: todayCustomerOrdersMapped,
      pages: totalPages,
      total: countTodayCustomerOrders,
    };
    return result;
  };

const getAllOrders = async (req: Request):
  Promise<DTO.GetAllOrderResponse | Error> => {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;

    const { status, page = '1', startDate, endDate } = req.query as {
      status?: OrderStatus | 'UNPAID',
      page?: string,
      startDate?: string,
      endDate?: string,
    };

    const numberedLimit = 10;
    const numberedPage = Number(page);
    if (isNaN(numberedPage)) {
      throw new BadRequest('numberedPage is not number.');
    }

    let filter: Prisma.OrderWhereInput = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequest('startDate or endDate is not valid.');
      }

      start.setHours(0, 0, 0);
      end.setHours(23, 59, 59);

      if (dayjs(start).isAfter(dayjs(end))) {
        throw new BadRequest('startDate is greater than endDate.');
      }
      filter = {
        createdAt: { gte: start, lte: end },
      };
    }

    if (status && status === 'UNPAID') {
      filter = { isPaid: false, ...filter };
    }

    if (status && status !== 'UNPAID') {
      filter = { ...filter, status };
    }

    const orders = await prisma.order.findMany({
      where: { restaurantId, ...filter },
      include: {
        customer: {
          select: {
            username: true,
            name: true,
            avatar: true,
          }
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
      take: numberedLimit,
      skip: numberedLimit * (numberedPage - 1),
    });

    const countOrders = await prisma.order.count({
      where: { restaurantId, isPaid: false, ...filter },
    });
    const totalPages = Math.ceil(countOrders / numberedLimit);
    const ordersMapped = orders.map((order) => {
      const orderMappedItem: DTO.CustomerOrderNotBotramItem = {
        id: order.id,
        createdAt: order.createdAt,
        isGroup: order.isGroup,
        customer: {
          username: order.customer.username,
          name: order.customer.name,
          image: order.customer.avatar,
        },
        total: order.total,
        status: order.status,
        isPaid: order.isPaid,
      };
      if (order.isGroup) {
        (orderMappedItem as DTO.CustomerOrderBotramItem).botramGroup = {
          id: order.botramGroupMemberOrder!.botramGroupMember.botramGroupId,
          name: order.botramGroupMemberOrder!.botramGroupMember.botramGroup.name,
        }
      }
      return orderMappedItem;
    });
    const result: DTO.GetAllOrderResponse = {
      orders: ordersMapped,
      pages: totalPages,
      total: countOrders, 
    };
    return result;
  };

const findOrderDetailByCustomerUsername = async (
  req: Request
): Promise<DTO.GetDetailOrderResponse | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;

  const { customerUsername } = req.query;
  if (!customerUsername) {
    throw new BadRequest('customerUsername query is missing.');
  }

  const foundCustomer = await prisma.customer.findUnique({
    where: { username: customerUsername as string },
  });
  if (!foundCustomer) {
    throw new NotFound('Customer is not found.');
  }

  const foundCustomerOrder = await prisma.order.findFirst({
    where: { restaurantId, customerId: foundCustomer.id, status: 'READY_TO_ORDER' },
    include: {
      customer: {
        select: {
          username: true,
          name: true,
        },
      },
      orderedCustomMenus: {
        include: {
          orderedCustomMenuSpicyLevel: {
            select: {
              level: true,
            },
          },
        },
      },
      orderedMenus: {
        include: {
          orderedMenuSpicyLevel: {
            select: {
              level: true,
            },
          },
        },
      },
    },
  });

  if (!foundCustomerOrder) {
    throw new NotFound('Customer order is not found.');
  }

  if (foundCustomerOrder.isGroup) {
    const foundBotramGroup = await prisma.botramGroup.findFirst({
      where: { creatorCustomerId: foundCustomer.id, status: 'ALL_READY_ORDER' },
      include: {
        creatorCustomer: {
          select: {
            username: true,
            name: true,
          },
        },
        order: true,
        members: {
          include: {
            customer: {
              select: {
                username: true,
                name: true,
              },
            },
            memberOrder: {
              include: {
                order: {
                  include: {
                    orderedMenus: {
                      include: {
                        orderedMenuSpicyLevel: {
                          select: {
                            level: true,
                          },
                        },
                      },
                    },
                    orderedCustomMenus: {
                      include: {
                        orderedCustomMenuSpicyLevel: {
                          select: {
                            level: true,
                          }
                        }
                      }
                    }
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!foundBotramGroup || !foundBotramGroup.order) {
      throw new NotFound('Customer order is not found.');
    }

    const botramMemberOrderMapped: DTO.BotramGroupOrderDetailResponse['memberOrder'] =
    foundBotramGroup.members
      .filter((member) => member.status === 'ORDER_READY')
      .map((member) => ({
        member: {
          username: member.customer.username,
          name: member.customer.name,
        },
        order: {
          isPaid: member.memberOrder!.order.isPaid,
          orderedMenu: orderedMenusMapping(member.memberOrder?.order.orderedMenus ?? []),
          orderedCustomMenu: orderedCustomMenusMapping(member.memberOrder?.order.orderedCustomMenus ?? []),
        },
      }));

    const result: DTO.BotramGroupOrderDetailResponse = {
      id: foundBotramGroup.order!.id,
      createdAt: foundBotramGroup.order.createdAt,
      isGroup: true,
      botramGroup: {
        id: foundBotramGroup.id,
        name: foundBotramGroup.name,
        admin: {
          username: foundBotramGroup.creatorCustomer.username,
          name: foundBotramGroup.creatorCustomer.name,
        },
      },
      status: foundBotramGroup.order.status,
      isPaid: foundBotramGroup.order.isPaid,
      memberOrder: botramMemberOrderMapped,
    };
    return result;
  }

  const result: DTO.CustomerOrderDetailResponse = {
    id: foundCustomerOrder.id,
    createdAt: foundCustomerOrder.createdAt,
    isGroup: foundCustomerOrder.isGroup,
    customer: {
      username: foundCustomerOrder.customer.username,
      name: foundCustomerOrder.customer.name,
    },
    status: foundCustomerOrder.status,
    isPaid: foundCustomerOrder.isPaid,
    orderedMenu: orderedMenusMapping(foundCustomerOrder.orderedMenus),
    orderedCustomMenu: orderedCustomMenusMapping(foundCustomerOrder.orderedCustomMenus),
  };
  return result;
};

const getDetailOrderById = async (req: Request):
  Promise<DTO.GetDetailOrderResponse | Error> => {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
    const { orderId } = req.params;

    const foundCustomerOrder = await prisma.order.findUnique({
      where: { id: orderId, restaurantId },
      include: {
        customer: {
          select: {
            username: true,
            name: true,
          },
        },
        orderedMenus: {
          include: {
            orderedMenuSpicyLevel: {
              select: { level: true },
            },
          }
        },
        orderedCustomMenus: {
          include: {
            orderedCustomMenuSpicyLevel: {
              select: { level: true },
            },
          }
        },
      },
    });

    if (!foundCustomerOrder) {
      const foundBotramOrder = await prisma.botramGroupOrder.findUnique({
        where: { id: orderId, restaurantId },
        include: {
          botramGroup: {
            include: {
              creatorCustomer: {
                select: {
                  username: true,
                  name: true,
                }
              },
              members: {
                include: {
                  customer: {
                    select: {
                      username: true,
                      name: true,
                    },
                  },
                  memberOrder: {
                    include: {
                      order: {
                        include: {
                          orderedMenus: {
                            include: {
                              orderedMenuSpicyLevel: true,
                            }
                          },
                          orderedCustomMenus: {
                            include: {
                              orderedCustomMenuSpicyLevel: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!foundBotramOrder) {
        throw new NotFound('Order is not found.');
      }

      const botramMemberOrderMapped: DTO.BotramGroupOrderDetailResponse['memberOrder'] =
        foundBotramOrder.botramGroup.members
        .filter((member) => member.status === 'ORDER_READY')
        .map((member) => ({
          member: {
            username: member.customer.username,
            name: member.customer.name,
          },
          order: {
            isPaid: member.memberOrder!.order.isPaid,
            orderedMenu: orderedMenusMapping(member.memberOrder?.order.orderedMenus ?? []),
            orderedCustomMenu: orderedCustomMenusMapping(member.memberOrder?.order.orderedCustomMenus ?? []),
          },
        }));

      const result: DTO.BotramGroupOrderDetailResponse = {
        id: foundBotramOrder.id,
        createdAt: foundBotramOrder.createdAt,
        isGroup: true,
        botramGroup: {
          id: foundBotramOrder.botramGroupId,
          name: foundBotramOrder.botramGroup.name,
          admin: {
            username: foundBotramOrder.botramGroup.creatorCustomer.username,
            name: foundBotramOrder.botramGroup.creatorCustomer.name,
          },
        },
        status: foundBotramOrder.status,
        isPaid: foundBotramOrder.isPaid,
        memberOrder: botramMemberOrderMapped,
      };
      return result;
    };

    const result: DTO.CustomerOrderDetailResponse = {
      id: foundCustomerOrder.id,
      createdAt: foundCustomerOrder.createdAt,
      isGroup: foundCustomerOrder.isGroup,
      customer: {
        username: foundCustomerOrder.customer.username,
        name: foundCustomerOrder.customer.name,
      },
      status: foundCustomerOrder.status,
      isPaid: foundCustomerOrder.isPaid,
      orderedMenu: orderedMenusMapping(foundCustomerOrder.orderedMenus),
      orderedCustomMenu: orderedCustomMenusMapping(foundCustomerOrder.orderedCustomMenus),
    };
    return result;
  };

const updateCustomerOrderStatus = async (
  req: Request
): Promise<Order['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  const { orderId } = req.params;
  if (!orderId) {
    throw new BadRequest('orderId param is missing.');
  }

  const body = req.body as {
    status: 'ACCEPTED' | 'PROCESSED' | 'DONE' | 'CANCEL',
  };

  if (!body.status) {
    throw new BadRequest('status body payload is missing');
  }

  if (!['ACCEPTED', 'PROCESSED', 'DONE', 'CANCEL'].includes(body.status)) {
    throw new BadRequest('status body payload is invalid.');
  }

  const foundCustomerOrder = await prisma.order.findUnique({
    where: { id: orderId, restaurantId },
    include: {
      orderedMenus: {
        include: {
          menu: true,
          orderedMenuSpicyLevel: true,
        },
      },
      orderedCustomMenus: {
        include: {
          customMenu: {
            include: {
              pickedCustomMenuCompositions: {
                include: {
                  customMenuComposition: true,
                },
              },
            },
          },
          orderedCustomMenuSpicyLevel: true,
        },
      },
    },
  });

  if (!foundCustomerOrder) {
    throw new NotFound('Order is not found.');
  }

  let orderUpdateInput: Prisma.OrderUpdateInput = {};
  if (body.status === 'ACCEPTED') {
    if (foundCustomerOrder.status !== 'READY_TO_ORDER') {
      throw new BadRequest(
        'status body payload is invalid. ACCEPTED is allowed if status order is READY_TO_ORDER'
      );
    }

    let calculatedTotalOrder = 0;
    if (foundCustomerOrder.orderedMenus.length > 0) {
      foundCustomerOrder.orderedMenus.map(async (orderedMenu) => {
        if (orderedMenu.quantity > orderedMenu.menu.stock) {
          throw new BadRequest('Menu stock is running out. Try again later.');
        }
        let orderedMenuTotalPrice = orderedMenu.totalPrice;
        if (orderedMenu.menuPrice !== orderedMenu.menu.price) {
          orderedMenuTotalPrice = orderedMenu.quantity * orderedMenu.menu.price,
          await prisma.orderedMenu.update({
            where: { id: orderedMenu.id },
            data: {
              menuPrice: orderedMenu.menu.price,
              totalPrice: orderedMenu.quantity * orderedMenu.menu.price,
            },
          });
        }
        calculatedTotalOrder += orderedMenuTotalPrice;
      });
    }
    if (foundCustomerOrder.orderedCustomMenus.length > 0) {
      foundCustomerOrder.orderedCustomMenus.map(async (orderedCustomMenu) => {
        let orderedCustomMenuTotalPrice = orderedCustomMenu.totalPrice;
        let orderedCustomMenuPrice = orderedCustomMenu.customMenuPrice;
        let currentOrderedCustomMenuPrice = 0;
        orderedCustomMenu.customMenu.pickedCustomMenuCompositions.map((pickCustMenu) => {
          const isStockAvailable = pickCustMenu.qty > pickCustMenu.customMenuComposition.stock; 
          if (!isStockAvailable) {
            throw new BadRequest('Item is run out of stock. Please try again later.');
          }
          currentOrderedCustomMenuPrice += (pickCustMenu.customMenuComposition.price * pickCustMenu.qty);
        });
        if (currentOrderedCustomMenuPrice !== orderedCustomMenuPrice) {
          await prisma.customMenu.update({
            where: { id: orderedCustomMenu.customMenuId },
            data: { price: currentOrderedCustomMenuPrice },
          });
          orderedCustomMenuTotalPrice = orderedCustomMenu.quantity * orderedCustomMenu.customMenu.price;
          await prisma.orderedCustomMenu.update({
            where: { id: orderedCustomMenu.id },
            data: {
              customMenuPrice: currentOrderedCustomMenuPrice,
              totalPrice: orderedCustomMenu.quantity * orderedCustomMenu.customMenu.price,
            },
          });
        }
        calculatedTotalOrder += orderedCustomMenuTotalPrice;
      });
    }

    if (restaurant!.customerPayment) {
      orderUpdateInput = { ...orderUpdateInput, isPaid: true };
    }
    if (calculatedTotalOrder !== foundCustomerOrder.total) {
      orderUpdateInput = { ...orderUpdateInput, total: calculatedTotalOrder };
    }
    orderUpdateInput = { ...orderUpdateInput, status: 'ACCEPTED_BY_RESTO' };
  }

  if (body.status === 'PROCESSED') {
    if (foundCustomerOrder.status !== 'ACCEPTED_BY_RESTO') {
      throw new BadRequest(
        'status body payload is invalid. PROCESSED is allowed if status order is ACCEPTED_BY_RESTO'
      );
    }
    orderUpdateInput = { ...orderUpdateInput, status: 'PROCESSED_BY_RESTO' };
  }

  if (body.status === 'DONE') {
    if (foundCustomerOrder.status !== 'PROCESSED_BY_RESTO') {
      throw new BadRequest(
        'status body payload is invalid. DONE is allowed if status order is PROCESSED_BY_RESTO'
      );
    }
    orderUpdateInput = { ...orderUpdateInput, status: 'DONE_BY_RESTO' };
  }

  if (body.status === 'CANCEL') {
    if (foundCustomerOrder.status !== 'PROCESSED_BY_RESTO') {
      throw new BadRequest(
        'status body payload is invalid. CANCEL is allowed if status order is PROCESSED_BY_RESTO'
      );
    }
    orderUpdateInput = { ...orderUpdateInput, status: 'CANCEL_BY_RESTO' };
  }

  const updatedCustomerOrderStatus = await prisma.order.update({
    where: { id: foundCustomerOrder.id },
    data: { ...orderUpdateInput },
  });
  return updatedCustomerOrderStatus.id;
};

const updateCustomerOrderPaymentStatus = async (
  req: Request
): Promise<Order['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  const { orderId } = req.params;
  if (!orderId) {
    throw new BadRequest('orderId param is missing.');
  }

  const foundCustomerOrder = await prisma.order.findUnique({
    where: { id: orderId, restaurantId },
  });
  if (!foundCustomerOrder) {
    throw new NotFound('Order is not found.');
  }

  if (foundCustomerOrder.isPaid) {
    throw new BadRequest('Order status has been paid.');
  }

  const updatedCustomerOrderPaymentStatus = await prisma.order.update({
    where: { id: foundCustomerOrder.id },
    data: { isPaid: true},
  });
  return updatedCustomerOrderPaymentStatus.id;
};

export {
  getCountOrder,
  getTodayOrder,
  getAllOrders,
  getDetailOrderById,
  findOrderDetailByCustomerUsername,
  updateCustomerOrderStatus,
  updateCustomerOrderPaymentStatus,
};

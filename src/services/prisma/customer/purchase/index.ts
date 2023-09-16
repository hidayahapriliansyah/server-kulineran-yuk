import { Request } from 'express';

import * as DTO from './types';
import { Customer, Prisma } from '@prisma/client';
import prisma from '../../../../db';
import { BadRequest } from '../../../../errors';

const getPurchase = async (
  req: Request
): Promise<DTO.GetPurchaseResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

  const { startDate, endDate, page = '1' } = req.query as {
    startDate?: string,
    endDate?: string,
    page?: string,
  };

  const numberedLimit = 10;
  const numberedPage = Number(page);
  if (isNaN(numberedPage)) {
    throw new BadRequest('page query is not number.');
  }

  let filter: Prisma.OrderWhereInput = {};
  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0);
    const end = new Date(endDate);
    end.setHours(29, 59, 59);
    filter = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };
  }

  const purchases = await prisma.order.findMany({
    where: { customerId, ...filter, status: 'ACCEPTED_BY_CUSTOMER' },
    include: {
      restaurant: {
        select: {
          id: true,
          username: true,
          name: true,
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
                }
              },
            },
          },
        },
      },
    },
    take: 10,
    skip: numberedLimit * (numberedPage - 1),
  });

  const result: DTO.GetPurchaseResponse = purchases.map((purchase) => {
    const purchaseItem: DTO.PurchaseNotBotramItem = {
      id: purchase.id,
      createdAt: purchase.createdAt,
      isGroup: purchase.isGroup,
      restaurant: {
        id: purchase.restaurantId,
        username: purchase.restaurant.username,
        name: purchase.restaurant.name,
      },
      isPaid: purchase.isPaid,
      status: purchase.status as 'ACCEPTED_BY_CUSTOMER',
      total: purchase.total,
    };
    if (purchase.isGroup) {
      (purchaseItem as DTO.PurchaseBotramItem).botramGroup = {
        id: purchase.botramGroupMemberOrder!.botramGroupMember.botramGroupId,
        name: purchase.botramGroupMemberOrder!.botramGroupMember.botramGroup.name,
      };
    }
    return purchaseItem;
  });
  return result;
};

export {
  getPurchase,
};

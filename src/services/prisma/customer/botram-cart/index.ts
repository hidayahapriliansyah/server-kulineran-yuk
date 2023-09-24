import { Request } from 'express';
import * as DTO from './types';
import { BotramGroupCustomMenuCart, BotramGroupMenuCart, Customer } from '@prisma/client';
import prisma from '../../../../db';
import { BadRequest, NotFound, Unauthorized } from '../../../../errors';

const getBotramCart = async (
  req: Request,
): Promise<DTO.GetBotramCartResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

  const botramGroupMembership = await prisma.botramGroupMember.findFirst({
    where: { customerId, status: 'ORDERING' },
    include: {
      botramGroup: {
        include: {
          restaurant: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      botramGroupMenuCarts: true,
      botramGroupCustomMenuCarts: true,
    }
  });
  const botramMenuCarts = botramGroupMembership?.botramGroupMenuCarts ?? [];
  const botramCustomMenuCarts = botramGroupMembership?.botramGroupCustomMenuCarts ?? [];
  const allOfBotramCart = [...botramMenuCarts, ...botramCustomMenuCarts];

  const result: DTO.GetBotramCartResponse = botramGroupMembership
    ? {
      botramGroup: {
        name: botramGroupMembership.botramGroup.name,
        resturant: {
          id: botramGroupMembership.botramGroup.restaurantId,
          username: botramGroupMembership.botramGroup.restaurant.username,
          name: botramGroupMembership.botramGroup.restaurant.name,
          image: botramGroupMembership.botramGroup.restaurant.avatar,
        }
      },
      totalCartItem: allOfBotramCart.length,
    }
    : null;
  return result;
};

const addMenuToBotramCart = async (
  req: Request,
): Promise<BotramGroupMenuCart['id'] | BotramGroupCustomMenuCart['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

  const body: DTO.AddMenuToBotramCartBodyRequest =
    DTO.addMenuToBotramCartBodySchema.parse(req.body);

  const botramGroupMembership = await prisma.botramGroupMember.findFirst({
    where: { customerId, botramGroupId: body.botramGroupId },
  });
  if (!botramGroupMembership) {
    throw new NotFound('Botram group is not found.');
  }
  if (body.menu.isCustomMenu) {
    const foundCustomMenu = await prisma.customMenu.findUnique({
      where: { id: body.menu.id },
      include: {
        pickedCustomMenuCompositions: {
          include: {
            customMenuComposition: true,
          },
        },
      },
    });
    if (!foundCustomMenu) {
      throw new NotFound('Custom Menu is not found.');
    }
    foundCustomMenu.pickedCustomMenuCompositions.map((pickedComposition) => {
      const compareStock = pickedComposition.qty * body.quantity;
      if (compareStock > pickedComposition.customMenuComposition.stock) {
        throw new BadRequest('Item is run out of stock. Please try again later.');
      }
    });
    const addedBotramCustomMenuCart = await prisma.botramGroupCustomMenuCart.create({
      data: {
        botramGroupId: botramGroupMembership.botramGroupId,
        botramGroupMemberId: botramGroupMembership.id,
        customMenuId: body.menu.id,
        quantity: body.quantity,
        isDibungkus: body.isDibungkus,
      }
    });
    if (body.spicyLevel) {
      await prisma.botramCustomMenuCartSpicyLevel.create({
        data: {
          botramGroupCustomMenuCartId: addedBotramCustomMenuCart.id,
          level: body.spicyLevel,
        }
      });
    }
    return addedBotramCustomMenuCart.id;
  }

  const foundMenu = await prisma.menu.findUnique({
    where: { id: body.menu.id },
  });
  if (!foundMenu) {
    throw new NotFound('Menu is not found.');
  }
  if (body.quantity > foundMenu.stock) {
    throw new BadRequest('Item is run out of stock. Please try again later.');
  }
  const addedBotramMenuCart = await prisma.botramGroupMenuCart.create({
    data: {
      botramGroupId: botramGroupMembership.botramGroupId,
      botramGroupMemberId: botramGroupMembership.id,
      menuId: body.menu.id,
      quantity: body.quantity,
      isDibungkus: body.isDibungkus,
    }
  });
  if (body.spicyLevel) {
    await prisma.botramMenuCartSpicyLevel.create({
      data: {
        botramGroupMenuCartId: addedBotramMenuCart.id,
        level: body.spicyLevel,
      }
    });
  }
  return addedBotramMenuCart.id;
};

const getItemsByBotramGroup = async (
  req: Request,
): Promise<DTO.GetItemsByBotramGroupResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { botramGroupId } = req.params;
  if (!botramGroupId) {
    throw new BadRequest('botramGroupId param is missing.');
  }

  const botramGroupMembership = await prisma.botramGroupMember.findFirst({
    where: { customerId, botramGroupId, status: 'ORDERING' },
    include: {
      botramGroup: {
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              username: true,
            }
          }
        }
      },
      botramGroupMenuCarts: {
        include: {
          menu: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          botramMenuCartSpicyLevel: true,
        },
        select: {
          id: true,
          isDibungkus: true,
          quantity: true,
        },
      },
      botramGroupCustomMenuCarts: {
        include: {
          customMenu: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          botramCustomMenuCartSpicyLevel: true,
        },
        select: {
          id: true,
          isDibungkus: true,
          quantity: true,
        },
      },
    }
  })
  if (!botramGroupMembership) {
    throw new NotFound('Botram group is not found.');
  }

  if (botramGroupMembership.botramGroupMenuCarts.length === 0
    && botramGroupMembership.botramGroupCustomMenuCarts.length === 0) {
    throw new NotFound('No cart item found.');
  }

  const result: DTO.GetItemsByBotramGroupResponse = botramGroupMembership
    ? {
      botramGroup: {
        id: botramGroupMembership.botramGroupId,
        name: botramGroupMembership.botramGroup.name,
        restaurant: {
          id: botramGroupMembership.botramGroup.restaurantId,
          name: botramGroupMembership.botramGroup.restaurant.name,
          username: botramGroupMembership.botramGroup.restaurant.username,
        },
      },
      items: {
        menuCarts: botramGroupMembership.botramGroupMenuCarts.map((item) => ({
          id: item.id,
          isDibungkus: item.isDibungkus,
          menu: {
            id: item.menuId,
            name: item.menu.name,
            price: item.menu.price,
          },
          quantity: item.quantity,
          spicyLevel: item.botramMenuCartSpicyLevel?.level ?? null,
        })),
        customMenuCarts: botramGroupMembership.botramGroupCustomMenuCarts.map((item) => ({
          id: item.id,
          isDibungkus: item.isDibungkus,
          customMenu: {
            id: item.customMenuId,
            name: item.customMenu.name,
            price: item.customMenu.price,
          },
          quantity: item.quantity,
          spicyLevel: item.botramCustomMenuCartSpicyLevel?.level ?? null,
        })),
      }
    }
    : null;
  return result;
};

const updateQtyOfBotramCartItem = async (
  req: Request,
): Promise<DTO.UpdateQtyOfBotramCartItemResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { botramCartId } = req.params;

  if (!botramCartId) {
    throw new BadRequest('botramCartId param is missing.');
  }

  const body = req.body as { quantity: number };
  if (!body.quantity) {
    throw new BadRequest('quantity body payload is missing.');
  }

  if (isNaN(Number(body.quantity))) {
    throw new BadRequest('quantity body payload is not number.');
  }

  const foundBotramMenuCartItem = await prisma.botramGroupMenuCart.findUnique({
    where: { id: botramCartId },
    include: {
      botramGroupMember: true,
      menu: true,
    }
  });
  if (!foundBotramMenuCartItem) {
    const foundBotramCustomMenuCartItem = await prisma.botramGroupCustomMenuCart.findUnique({
      where: { id: botramCartId },
      include: {
        botramGroupMember: true,
        customMenu: {
          include: {
            pickedCustomMenuCompositions: {
              include: {
                customMenuComposition: true,
              }
            }
          }
        },
      },
    });
    if (!foundBotramCustomMenuCartItem) {
      throw new NotFound('Menu cart item is not found.');
    }
    if (foundBotramCustomMenuCartItem.botramGroupMember.customerId !== customerId) {
      throw new Unauthorized('Membership is not found.');
    }
    let isAvailableToAddMore = true;
    foundBotramCustomMenuCartItem.customMenu.pickedCustomMenuCompositions.map((pickedComposition) => {
      const compareStock = (pickedComposition.qty * foundBotramCustomMenuCartItem.quantity)
        + (pickedComposition.qty * body.quantity);

      if (compareStock > pickedComposition.customMenuComposition.stock) {
        throw new BadRequest('Item is run out of stock. Please try again later.');
      }
      if (compareStock === pickedComposition.customMenuComposition.stock) {
        isAvailableToAddMore = false;
      }
    });

    const updatedQty = await prisma.botramGroupCustomMenuCart.update({
      where: {
        id: foundBotramCustomMenuCartItem.id,
        botramGroupMemberId: foundBotramCustomMenuCartItem.botramGroupMemberId,
      },
      data: { quantity: body.quantity },
    });

    const result: DTO.UpdateQtyOfBotramCartItemResponse = {
      botramCartId: updatedQty.id,
      isAvailableToAddMore,
    };
    return result;
  }
  if (foundBotramMenuCartItem.botramGroupMember.customerId !== customerId) {
    throw new Unauthorized('Membership is not found.');
  }

  if (foundBotramMenuCartItem.quantity + body.quantity > foundBotramMenuCartItem.menu.stock) {
    throw new BadRequest('Item is run out of stock. Please try again later.');
  }

  let isAvailableToAddMore = true;
  if (foundBotramMenuCartItem.quantity + body.quantity === foundBotramMenuCartItem.menu.stock) {
    isAvailableToAddMore = false;
  }
  const updatedQty = await prisma.botramGroupMenuCart.update({
    where: {
      id: foundBotramMenuCartItem.id,
      botramGroupMemberId: foundBotramMenuCartItem.botramGroupMemberId
    },
    data: { quantity: body.quantity },
  });

  const result: DTO.UpdateQtyOfBotramCartItemResponse = {
    botramCartId: updatedQty.id,
    isAvailableToAddMore,
  };
  return result;
};

const deleteBotramCartItem = async (
  req: Request,
): Promise<BotramGroupMenuCart['id'] | BotramGroupCustomMenuCart['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { botramCartId } = req.params;
  if (!botramCartId) {
    throw new BadRequest('botramCartId param is missing.');
  }

  const foundBotramMenuCartItem = await prisma.botramGroupMenuCart.findUnique({
    where: { id: botramCartId },
    include: {
      botramGroupMember: true,
      botramMenuCartSpicyLevel: true,
    }
  });
  if (!foundBotramMenuCartItem) {
    const foundBotramCustomMenuCartItem = await prisma.botramGroupCustomMenuCart.findUnique({
      where: { id: botramCartId },
      include: {
        botramGroupMember: true,
        botramCustomMenuCartSpicyLevel: true,
      }
    });
    if (!foundBotramCustomMenuCartItem) {
      throw new NotFound('Menu cart item is not found.');
    }

    if (foundBotramCustomMenuCartItem.botramGroupMember.customerId !== customerId) {
      throw new Unauthorized('Membership is not found.');
    }

    if (foundBotramCustomMenuCartItem.botramCustomMenuCartSpicyLevel) {
      await prisma.botramCustomMenuCartSpicyLevel.delete({
        where: { id: foundBotramCustomMenuCartItem.botramCustomMenuCartSpicyLevel.id },
      });
    }
    const deletedBotramCustomMenuCart = await prisma.botramGroupCustomMenuCart.delete({
      where: {
        id: botramCartId,
        botramGroupMemberId: foundBotramCustomMenuCartItem.botramGroupMember.customerId
      },
    });
    return deletedBotramCustomMenuCart.id;
  }

  if (foundBotramMenuCartItem.botramGroupMember.customerId !== customerId) {
    throw new Unauthorized('Membership is not found.');
  }

  if (foundBotramMenuCartItem.botramMenuCartSpicyLevel) {
    await prisma.botramMenuCartSpicyLevel.delete({
      where: { id: foundBotramMenuCartItem.botramMenuCartSpicyLevel.id },
    });
  }
  const deletedBotramMenuCart = await prisma.botramGroupMenuCart.delete({
    where: {
      id: botramCartId,
      botramGroupMemberId: foundBotramMenuCartItem.botramGroupMember.customerId,
    },
  });
  return deletedBotramMenuCart.id;
};

const itemBulkDeletion = async (
  req: Request
): Promise<number | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

  const body: DTO.ItemBulkDeletionBodyRequest =
    DTO.itemBulkDeletionBodySchema.parse(req.body);

  let deletedItemCount = 0;
  body.itemIds.map(async (item) => {
    if (item.isCustomMenu) {
      const foundBotramCustomMenuCartItem = await prisma.botramGroupCustomMenuCart.findUnique({
        where: { id: item.id },
        include: {
          botramGroupMember: true,
          botramCustomMenuCartSpicyLevel: true,
        }
      });
      if (foundBotramCustomMenuCartItem?.botramGroupMember.customerId !== customerId) {
        throw new Unauthorized('Membership is not found.');
      }
      if (foundBotramCustomMenuCartItem?.botramCustomMenuCartSpicyLevel) {
        await prisma.botramCustomMenuCartSpicyLevel.delete({
          where: { id: foundBotramCustomMenuCartItem.botramCustomMenuCartSpicyLevel.id },
        });
      }
      const deletedItem = await prisma.botramGroupCustomMenuCart.delete({
        where: { id: item.id, botramGroupMemberId: foundBotramCustomMenuCartItem.botramGroupMember.id },
      });
      if (deletedItem) {
        deletedItemCount++;
      }
    } else {
      const foundBotramMenuCartItem = await prisma.botramGroupMenuCart.findUnique({
        where: { id: item.id },
        include: {
          botramGroupMember: true,
          botramMenuCartSpicyLevel: true,
        }
      });
      if (foundBotramMenuCartItem?.botramGroupMember.customerId !== customerId) {
        throw new Unauthorized('Membership is not found.');
      }
      if (foundBotramMenuCartItem?.botramMenuCartSpicyLevel) {
        await prisma.botramMenuCartSpicyLevel.delete({
          where: { id: foundBotramMenuCartItem.botramMenuCartSpicyLevel.id },
        });
      }
      const deletedItem = await prisma.botramGroupMenuCart.delete({
        where: { id: item.id, botramGroupMemberId: foundBotramMenuCartItem.botramGroupMember.customerId },
      });
      if (deletedItem) {
        deletedItemCount++;
      }
    }
  });
  return deletedItemCount;
};

export {
  getBotramCart,
  addMenuToBotramCart,
  getItemsByBotramGroup,
  updateQtyOfBotramCartItem,
  deleteBotramCartItem,
  itemBulkDeletion,
};

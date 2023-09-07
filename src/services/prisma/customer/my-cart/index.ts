import { Request } from 'express';

import prisma from '../../../../db';
import { CustomMenuCart, Customer, MenuCart } from '@prisma/client';
import * as DTO from './types';
import groupingCartByRestaurant from '../../../../utils/groupingCartByRestaurant';
import { BadRequest, NotFound } from '../../../../errors';

const getMyCart = async (req: Request):
  Promise<DTO.GetMyCartResponse | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

    const menuCart = await prisma.menuCart.findMany({
      where: { customerId },
      include: {
        restaurant: true,
      },
    });
    const customMenuCart = await prisma.customMenuCart.findMany({
      where: { customerId },
      include: {
        restaurant: true,
      },
    });

    const allOfMyCart = [...menuCart, ...customMenuCart];
    const myCart = groupingCartByRestaurant(allOfMyCart);

    const result: DTO.GetMyCartResponse = {
      restaurantCount: myCart.length,
      cart: myCart,
    };
    return result;
  };

const addMenuToMyCart = async (req: Request):
  Promise<MenuCart['id'] | CustomMenuCart['id'] | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

    const body: DTO.AddMenuToMyCartBodyRequest =
      DTO.addMenuToMyCartBodySchema.parse(req.body);

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
        throw new NotFound('Menu is not found.');
      }
      foundCustomMenu.pickedCustomMenuCompositions.map((pickedComposition) => {
        const compareStock = pickedComposition.qty * body.quantity;
        if (compareStock > pickedComposition.customMenuComposition.stock) {
          throw new BadRequest('Item is run out of stock. Please try again later.');
        }
      });
      const addedCustomMenuCart = await prisma.customMenuCart.create({
        data: {
          customerId,
          customMenuId: body.menu.id,
          restaurantId: foundCustomMenu.restaurantId,
          quantity: body.quantity,
          isDibungkus: body.isDibungkus,
        },
      });
      if (body.spicyLevel) {
        await prisma.customMenuCartSpicyLevel.create({
          data: {
            customMenuCartId: addedCustomMenuCart.id,
            level: body.spicyLevel,
          },
        });
      }
      return addedCustomMenuCart.id;
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
    const addedMenuCart = await prisma.menuCart.create({
      data: {
        customerId,
        menuId: body.menu.id,
        restaurantId: foundMenu.restaurantId,
        quantity: body.quantity,
        isDibungkus: body.isDibungkus,
      }
    });
    if (body.spicyLevel) {
      await prisma.menuCartSpicyLevel.create({
        data: {
          menuCartId: addedMenuCart.id,
          level: body.spicyLevel,
        }
      });
    }
    return addedMenuCart.id;
  };

const getItemsByRestaurant = async (req: Request): 
  Promise<DTO.GetItemsByRestaurantResponse | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
    const { restaurantId } = req.params;
    if (!restaurantId) {
      throw new BadRequest('restaurantId param is missing.');
    }

    const foundRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!foundRestaurant) {
      throw new NotFound('Restaurant is not found.');
    }

    const menuCartItems = await prisma.menuCart.findMany({
      where: { customerId, restaurantId },
      include: {
        menu: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        menuCartSpicyLevel: true,
      },
    });

    const customMenuCartItems = await prisma.customMenuCart.findMany({
      where: { customerId, restaurantId },
      include: {
        customMenu: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        customMenuCartSpicyLevel: true,
      },
    });

    if (menuCartItems.length === 0 && customMenuCartItems.length === 0) {
      throw new NotFound('No cart item found.');
    }

    const result: DTO.GetItemsByRestaurantResponse = {
      restaurant: {
        id: foundRestaurant.id,
        username: foundRestaurant.username,
        name: foundRestaurant.name,
      },
      items: {
        menuCarts: menuCartItems.map((item) => ({
          id: item.id,
          menu: {
            id: item.menuId,
            name: item.menu.name,
            price: item.menu.price,
          },
          isDibungkus: item.isDibungkus,
          quantity: item.quantity,
          spicyLevel: item.menuCartSpicyLevel?.level ?? null
        })),
        customMenuCarts: customMenuCartItems.map((item) => ({
          id: item.id,
          menu: {
            id: item.customMenuId,
            name: item.customMenu.name,
            price: item.customMenu.price,
          },
          isDibungkus: item.isDibungkus,
          quantity: item.quantity,
          spicyLevel: item.customMenuCartSpicyLevel?.level ?? null
        })),
      },
    };
    return result;
  };

const updateQtyOfMyCartItem = async (req: Request):
  Promise<DTO.UpdateQtyOfMyCartItemResponse | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
    const { myCartId } = req.params;

    if (!myCartId) {
      throw new BadRequest('myCartId param is missing.');
    }

    const body = req.body as { quantity: number };
    if (!body.quantity) {
      throw new BadRequest('quantity property is missing.');
    }

    if (isNaN(Number(body.quantity))) {
      throw new BadRequest('quantity property is not number.');
    }

    const foundMenuCartItem = await prisma.menuCart.findUnique({
      where: { id: myCartId },
      include: {
        menu: true,
      }
    });
    if (!foundMenuCartItem) {
      const foundCustomMenuCartItem = await prisma.customMenuCart.findUnique({
        where: { id: myCartId },
        include: {
          customMenu: {
            include: {
              pickedCustomMenuCompositions: {
                include: {
                  customMenuComposition: true,
                }
              }
            }
          },
        }
      });
      if (!foundCustomMenuCartItem) {
        throw new NotFound('Menu cart item is not found.');
      }

      let isAvailableToAddMore = true;
      foundCustomMenuCartItem!.customMenu.pickedCustomMenuCompositions.map((pickedComposition) => {
        const compareStock = (pickedComposition.qty * foundCustomMenuCartItem!.quantity)
          + (pickedComposition.qty * body.quantity);

        if (compareStock > pickedComposition.customMenuComposition.stock) {
          throw new BadRequest('Item is run out of stock. Please try again later.');
        }
        if (compareStock === pickedComposition.customMenuComposition.stock) {
          isAvailableToAddMore = false;
        }
      });

      const updatedQty = await prisma.customMenuCart.update({
        where: { id: foundCustomMenuCartItem!.id, customerId },
        data: { quantity: body.quantity },
      });

      const result: DTO.UpdateQtyOfMyCartItemResponse = {
        cartItemId: updatedQty.id,
        isAvailableToAddMore,
      };
      return result;
    }

    if (foundMenuCartItem.quantity +  body.quantity > foundMenuCartItem.menu.stock) {
      throw new BadRequest('Item is run out of stock. Please try again later.');
    }

    let isAvailableToAddMore = true;
    if (foundMenuCartItem.quantity +  body.quantity === foundMenuCartItem.menu.stock) {
      isAvailableToAddMore = false;
    }
    const updatedQty = await prisma.menuCart.update({
      where: { id: foundMenuCartItem.id, customerId },
      data: { quantity: body.quantity },
    });

    const result: DTO.UpdateQtyOfMyCartItemResponse = {
      cartItemId: updatedQty.id,
      isAvailableToAddMore,
    };
    return result;
  };

const deleteMyCartItem = async (req: Request):
  Promise<MenuCart['id'] | CustomMenuCart['id'] | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
    const { myCartId } = req.params;
    if (!myCartId) {
      throw new BadRequest('myCartId param is missing.');
    }

    const foundMenuCartItem = await prisma.menuCart.findUnique({
      where: { id: myCartId, customerId },
      include: {
        menuCartSpicyLevel: true,
      }
    });

    if (!foundMenuCartItem) {
      const foundCustomMenuCartItem = await prisma.customMenuCart.findUnique({
        where: { id: myCartId, customerId },
        include: {
          customMenuCartSpicyLevel: true,
        },
      });

      if (!foundCustomMenuCartItem) {
        throw new NotFound('Menu cart item is not found.');
      }

      if (foundCustomMenuCartItem.customMenuCartSpicyLevel) {
        await prisma.customMenuCartSpicyLevel.delete({
          where: { id: foundCustomMenuCartItem.customMenuCartSpicyLevel.id },
        });
      }
      const deletedCustomMenuCart = await prisma.customMenuCart.delete({
        where: { id: myCartId, customerId },
      });

      return deletedCustomMenuCart.id;
    }

    if (foundMenuCartItem.menuCartSpicyLevel) {
      await prisma.menuCartSpicyLevel.delete({
        where: { id: foundMenuCartItem.menuCartSpicyLevel.id },
      });
    }
    const deletedMenuCart = await prisma.menuCart.delete({
      where: { id: myCartId, customerId },
      include: {
        menuCartSpicyLevel: true,
      }
    });
    return deletedMenuCart.id;
  };

const itemBulkDeletion = async (req: Request):
  Promise<number | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

    const body: DTO.ItemBulkDeletionBodyRequest =
      DTO.itemBulkDeletionBodySchema.parse(req.body);

    let deletedItemCount = 0;
    body.itemIds.map(async (item) => {
      if (item.isCustomMenu) {
        const foundCustomMenuCartItem = await prisma.customMenuCart.findUnique({
          where: { id: item.id, customerId },
          include: {
            customMenuCartSpicyLevel: true,
          }
        });
        if (foundCustomMenuCartItem?.customMenuCartSpicyLevel) {
          await prisma.customMenuCartSpicyLevel.delete({
            where: { id: foundCustomMenuCartItem.customMenuCartSpicyLevel.id },
          });
        }
        const deletedItem = await prisma.customMenuCart.delete({
          where: { id: item.id, customerId },
        });
        if (deletedItem) {
          deletedItemCount++;
        }
      } else {
        const foundMenuCartItem = await prisma.menuCart.findUnique({
          where: { id: item.id, customerId },
          include: {
            menuCartSpicyLevel: true,
          },
        });
        if (foundMenuCartItem?.menuCartSpicyLevel) {
          await prisma.menuCartSpicyLevel.delete({
            where: { id: foundMenuCartItem.menuCartSpicyLevel.id },
          });
        }
        const deletedItem = await prisma.menuCart.delete({
          where: { id: item.id, customerId },
        });
        if (deletedItem) {
          deletedItemCount++;
        }
      }
    });
    return deletedItemCount;
  };

export {
  getMyCart,
  addMenuToMyCart,
  getItemsByRestaurant,
  updateQtyOfMyCartItem,
  deleteMyCartItem,
  itemBulkDeletion,
};

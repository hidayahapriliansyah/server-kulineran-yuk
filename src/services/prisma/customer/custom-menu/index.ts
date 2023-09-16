import { Request } from 'express';

import { Customer } from '@prisma/client';
import prisma from '../../../../db';
import * as DTO from './types';
import { BadRequest, NotFound } from '../../../../errors';

const getAllCustomMenu = async (
  req: Request,
): Promise<DTO.GetAllCustomMenuResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

  const customMenus = await prisma.customMenu.findMany({
    where: { customerId },
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
  });

  const result: DTO.GetAllCustomMenuResponse = 
    customMenus.map((customMenu) => ({
      id: customMenu.id,
      createdAt: customMenu.createdAt,
      name: customMenu.name,
      image:  customMenu.restaurant.avatar,
      restaurant: {
        id: customMenu.restaurant.id,
        name: customMenu.restaurant.name,
        username: customMenu.restaurant.username,
      }
    }));
  
  return result;
};

const createCustomMenu = async (
  req: Request,
): Promise<DTO.CustomMenuResponse['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  
  const body: DTO.CreateCustomMenuRequestBody = 
    DTO.createCustomMenuRequestBodySchema.parse(req.body);

  const existCustomMenuCategory = await prisma.customMenuCategory.findUnique({
    where: { id: body.customMenuCategoryId },
  });
  if (!existCustomMenuCategory) {
    throw new NotFound('Custom Menu Category is not found.');
  }

  let totalPrice = 0;
  await Promise.all(body.pickedCustomMenuComposition.map(async (pickedComposition) => {
      const composition = await prisma.customMenuComposition.findUnique({
        where: { id: pickedComposition.id },
      });
      if (!composition) {
        throw new NotFound('Custom Menu Composition is not found.');
      }
      totalPrice += (composition.price * pickedComposition.qty);
  }));

  const createdCustomMenu = await prisma.customMenu.create({
    data: {
      customerId,
      restaurantId: body.restaurantId,
      customMenuCategoryId: body.customMenuCategoryId,
      name: body.name,
      price: totalPrice,
    },
  });
  const compositionDataList = body.pickedCustomMenuComposition.map((composition) => ({
      customMenuId: createdCustomMenu.id,
      customMenuCompositionId: composition.id,
      qty: composition.qty,
  }));
  await prisma.pickedCustomMenuComposition.createMany({
    data: compositionDataList,
  });
  return createdCustomMenu.id;
};

const getCustomMenuById = async (
  req: Request,
): Promise<DTO.CustomMenuResponse | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

  const { customMenuId } = req.params;

  const customMenu = await prisma.customMenu.findUnique({
    where: { id: customMenuId, customerId },
    include: {
      restaurant: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
      customMenuCategory: {
        select: {
          id: true,
          name: true,
          isBungkusAble: true,
        }
      },
      pickedCustomMenuCompositions: {
        include: {
          customMenuComposition: {
            select: {
              id: true,
              name: true,
              image1: true,
              price: true,
            }
          }
        }
      }
    }
  });
  if (!customMenu) {
    throw new NotFound('Custom Menu is not found.');
  }

  const result: DTO.CustomMenuResponse = {
    id: customMenu.id,
    createdAt: customMenu.createdAt,
    name: customMenu.name,
    image: customMenu.restaurant.avatar,
    customMenuCategory: {
      id: customMenu.customMenuCategory.id,
      name: customMenu.customMenuCategory.name,
      isBungkusAble: customMenu.customMenuCategory.isBungkusAble,
    },
    restaurant: {
      id: customMenu.restaurant?.id,
      username: customMenu.restaurant?.username,
      name: customMenu.restaurant?.name,
    },
    pickedCustomMenuCompositions:
      customMenu.pickedCustomMenuCompositions.map((pickedComposition) => ({
        id: pickedComposition.id,
        customMenuComposition: {
          id: pickedComposition.customMenuComposition.id,
          image: pickedComposition.customMenuComposition.image1,
          name: pickedComposition.customMenuComposition.name,
          price: pickedComposition.customMenuComposition.price,
        },
        qty: pickedComposition.qty,
      })),
  };

  return result;
};

const updateCustomMenu = async (
  req: Request,
): Promise<DTO.CustomMenuResponse['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { customMenuId } = req.params;
  if (!customMenuId) {
    throw new BadRequest('customMenuId param is missing.');
  }

  const body: DTO.UpdateCustomMenuRequestBody = 
    DTO.updateCustomMenuRequestBodySchema.parse(req.body);

  let totalPrice = 0;
  await Promise.all(body.pickedCustomMenuComposition.map(async (pickedComposition) => {
      const composition = await prisma.customMenuComposition.findUnique({
        where: { id: pickedComposition.id },
      });
      if (!composition) {
        throw new NotFound('Custom Menu Composition is not found.');
      }
      const { price } = composition;
      totalPrice += (pickedComposition.qty * price);
  }));

  const updatedCustomMenu = await prisma.customMenu.update({
    where: { id: customMenuId, customerId },
    data: { name: body.name, price: totalPrice },
  });
  if (!updatedCustomMenu) {
    throw new NotFound('Custom Menu is not found.');
  }
  await prisma.pickedCustomMenuComposition.deleteMany({
    where: { customMenuId: updatedCustomMenu.id },
  });
  const compositionDataList = body.pickedCustomMenuComposition.map((composition) => ({
    customMenuId: updatedCustomMenu.id,
    customMenuCompositionId: composition.id,
    qty: composition.qty,
  }));
  await prisma.pickedCustomMenuComposition.createMany({
    data: compositionDataList,
  });
  return updatedCustomMenu.id;
};

const deleteCustomMenu = async (
  req: Request,
): Promise<DTO.CustomMenuResponse['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
  const { customMenuId } = req.params;
  if (!customMenuId) {
    throw new BadRequest('customMenuId param is missing.');
  }

  const deletedCustomMenu =await prisma.customMenu.delete({
    where: { id: customMenuId, customerId },
  });
  if (!deletedCustomMenu) {
    throw new NotFound('Custom Menu is not found.');
  }
  await prisma.pickedCustomMenuComposition.deleteMany({
    where: { customMenuId },
  });
  return deletedCustomMenu.id;
};

export {
  getAllCustomMenu,
  createCustomMenu,
  getCustomMenuById,
  updateCustomMenu,
  deleteCustomMenu,
};

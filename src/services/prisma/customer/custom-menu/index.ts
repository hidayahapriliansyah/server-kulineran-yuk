import { Request } from 'express';

import { Customer } from '@prisma/client';
import prisma from '../../../../db';
import * as DTO from './types';
import { BadRequest, NotFound } from '../../../../errors';

const getAllCustomMenu = async (req: Request):
  Promise<DTO.GetAllCustomMenuResponse | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
    try {
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
    } catch (error: any) {
      throw error;
    }
  };

const createCustomMenu = async (req: Request):
  Promise<DTO.CustomMenuResponse['id'] | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
    
    const body: DTO.CreateCustomMenuRequestBody = 
      DTO.createCustomMenuRequestBodySchema.parse(req.body);

    const existCustomMenuCategory = await prisma.customMenuCategory.findUnique({
      where: { id: body.customMenuCategoryId },
    });
    if (!existCustomMenuCategory) {
      throw new NotFound('customMenuCategoryId is not found. Please input valid customMenuCategoryId.');
    }

    let totalPrice = 0;
    await Promise.all(body.pickedCustomMenuComposition.map(async (pickedComposition) => {
        const composition = await prisma.customMenuComposition.findUnique({
          where: { id: pickedComposition.id },
        });
        if (!composition) {
          throw new NotFound('customMenuCompositionId is not found. Please input valid customMenuCompositionId.');
        }
        totalPrice += (composition.price * pickedComposition.qty);
    }));

    try {
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
    } catch (error: any) {
      throw error;
    }
  };

const getCustomMenuById = async (req: Request):
  Promise<DTO.CustomMenuResponse | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
    try {
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
        throw new NotFound('Custom Menu Id not found. Please input valid custom menu id.');
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
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Custom Menu Id not found. Please input valid custom menu id.');
      }
      throw error;
    }
  };

const updateCustomMenu = async (req: Request):
  Promise<DTO.CustomMenuResponse['id'] | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
    const { customMenuId } = req.params;
    if (!customMenuId) {
      throw new BadRequest('Invalid input. customMenuId param is missing.');
    }

    const body: DTO.UpdateCustomMenuRequestBody = 
      DTO.updateCustomMenuRequestBodySchema.parse(req.body);

    let totalPrice = 0;
    await Promise.all(body.pickedCustomMenuComposition.map(async (pickedComposition) => {
        const composition = await prisma.customMenuComposition.findUnique({
          where: { id: pickedComposition.id },
        });
        if (!composition) {
          throw new NotFound('customMenuCompositionId is not found. Please input valid customMenuCompositionId.');
        }
        const { price } = composition;
        totalPrice += (pickedComposition.qty * price);
    }));

    try {
      const updatedCustomMenu = await prisma.customMenu.update({
        where: { id: customMenuId, customerId },
        data: { name: body.name, price: totalPrice },
      });
      if (!updatedCustomMenu) {
        throw new NotFound('Custom Menu Id not found. Please input valid custom menu id.');
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
    } catch (error: any) {
      throw error;
    }
  };

const deleteCustomMenu = async (req: Request):
  Promise<DTO.CustomMenuResponse['id'] | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
    const { customMenuId } = req.params;
    if (!customMenuId) {
      throw new BadRequest('Invalid input. customMenuId param is missing.');
    }

    try {
      const deletedCustomMenu =await prisma.customMenu.delete({
        where: { id: customMenuId, customerId },
      });
      if (!deletedCustomMenu) {
        throw new NotFound('Custom Menu Id not found. Please input valid custom menu id.');
      }
      await prisma.pickedCustomMenuComposition.deleteMany({
        where: { customMenuId },
      });
      return deletedCustomMenu.id;
    } catch (error: any) {
      throw error;
    }
  };

export {
  getAllCustomMenu,
  createCustomMenu,
  getCustomMenuById,
  updateCustomMenu,
  deleteCustomMenu,
};

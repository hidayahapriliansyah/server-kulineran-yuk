import { Request } from 'express';

import { CustomMenuCategory, Restaurant } from '@prisma/client';
import prisma from '../../../../db';
import * as DTO from './types';
import { BadRequest, NotFound } from '../../../../errors';

const getAllCustomMenuCategory = async (req: Request):
  Promise<Pick<DTO.CustomMenuCategoryResponse, 'id' | 'name'>[] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
    try {
      const customMenuCategories = await prisma.customMenuCategory.findMany({
        where: { restaurantId },
      });

      const result: Pick<DTO.CustomMenuCategoryResponse, 'id' | 'name'>[] =
        customMenuCategories.map((item) => ({
          id: item.id,
          name: item.name,
        }));
      return result;
    } catch (error: any) {
      throw error;
    }
  };

const createCustomMenuCategory = async (req: Request):
  Promise<CustomMenuCategory['id'] | Error> => {
    const { id: restaurantId } = req.user as { id: Restaurant['id'] };
    try {
      const body: DTO.CustomMenuCategoryBody =
        DTO.customMenuCategoryBodySchema.parse(req.body);

      const createdCustomMenuCategory = await prisma.customMenuCategory.create({
        data: {
          restaurantId,
          name: body.name,
          isBungkusAble: body.isBungkusAble,
        },
      });

      if (body.maxSpicy) {
        await prisma.customMenuCategorySpicyLevel.create({
          data: {
            customMenuCategoryId: createdCustomMenuCategory.id,
            maxSpicy: body.maxSpicy,
          }
        });
      }

      const result = createdCustomMenuCategory.id;
      return result;
    } catch (error: any) {
      throw error;
    }
  };

const getSpecificCustomMenuCategory = async (req: Request):
  Promise<DTO.CustomMenuCategoryResponse | Error> => {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
    try {
      const { categoryId } = req.params;
      const customMenuCategory = await prisma.customMenuCategory.findUnique({
        where: { id: categoryId, restaurantId },
        include: { customMenuCategorySpicyLevel: true },
      });

      if (!customMenuCategory) {
        throw new NotFound('Custom Menu category id is not found. Please input valid category custom menu id.');
      }

      const result: DTO.CustomMenuCategoryResponse = {
        id: customMenuCategory.id,
        name: customMenuCategory.name,
        isBungkusAble: customMenuCategory.isBungkusAble,
        maxSpicy: customMenuCategory.customMenuCategorySpicyLevel?.maxSpicy ?? null,
      };

      return result;
    } catch (error: any) {
      throw error;
    }
  };

const updateCustomMenuCategory = async (req: Request):
  Promise<DTO.CustomMenuCategoryResponse['id'] | Error> => {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
    try {
      const { categoryId } = req.params;
      if (!categoryId) {
        throw new BadRequest('Invalid Request. Category id is undefined. Please check your input data.');
      }

      const body: DTO.CustomMenuCategoryBody =
        DTO.customMenuCategoryBodySchema.parse(req.body);

      const updatedCustomMenuCategory = await prisma.customMenuCategory.update({
        where: { id: categoryId, restaurantId },
        data: { name: body.name, isBungkusAble: body.isBungkusAble },
      });

      if (!updatedCustomMenuCategory) {
        throw new NotFound('Menu Id not found. Please input valid id menu.');
      }

      const customMenuCategoryHasSpicyLevel =
        await prisma.customMenuCategorySpicyLevel.findUnique({ 
          where: {
            customMenuCategoryId: categoryId,
          },
        });
      if (customMenuCategoryHasSpicyLevel && body.maxSpicy) {
        await prisma.customMenuCategorySpicyLevel.update({
          where: { customMenuCategoryId: categoryId },
          data: { maxSpicy: body.maxSpicy },
        });
      } else if (customMenuCategoryHasSpicyLevel && !body.maxSpicy) {
        await prisma.customMenuCategorySpicyLevel.delete({
          where: { customMenuCategoryId: categoryId }
        });
      } else if ((!customMenuCategoryHasSpicyLevel && body.maxSpicy)) {
        await prisma.customMenuCategorySpicyLevel.create({
          data: {
            customMenuCategoryId: categoryId,
            maxSpicy: body.maxSpicy,
          }
        });
      }

      return updatedCustomMenuCategory.id;
    } catch (error: any) {
      throw error;
    }
  };

const deleteCustomMenuCategory = async (req: Request):
  Promise<DTO.CustomMenuCategoryResponse['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      throw new BadRequest('Invalid Request. Category id is undefined. Please check your input data.');
    }

    const customMenuCategoryHasComponentCustomMenu =
      await prisma.customMenuComposition.findFirst({
        where: { customMenuCategoryId: categoryId },
      });
    if (customMenuCategoryHasComponentCustomMenu) {
      throw new BadRequest('Custom Menu Category has at least one composition. Category can not be deleted. Please make sure there is no composition with this category to delete it.');
    }

    const customMenuCategoryHasSpicyLevel =
      await prisma.customMenuCategorySpicyLevel.findUnique({
        where: { customMenuCategoryId: categoryId },
      });
    if (customMenuCategoryHasSpicyLevel) {
      await prisma.customMenuCategorySpicyLevel.delete({
        where: { customMenuCategoryId: categoryId },
      });
    }

    const deletedCustomMenuCategory =
      await prisma.customMenuCategory.delete({
        where: { id: categoryId, restaurantId },
      });
    if (!deletedCustomMenuCategory) {
      throw new NotFound('Menu Id not found. Please input valid id menu.');
    }
    return deletedCustomMenuCategory.id;
  } catch (error: any) {
    throw error;
  }
  };

const getAllCustomMenuComposition = async (req: Request):
  Promise<DTO.GetCustomMenuCompositionsWithPaginated | Error>=> {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
    const { limit = '10', page = '1', category, name }: {
      limit?: string,
      page?: string,
      category?: string,
      name?: string,
    } = req.query;

    const numberedLimit = parseInt(limit);
    const numberedPage = parseInt(page);
    if (isNaN(numberedLimit) || isNaN(numberedPage)) {
      throw new BadRequest('Invalid Request. Please check your input data.');
    }
    let filter = {};
    if (category) {
      filter = { ...filter, customMenuCategoryId: category };
    }
    if (name) {
      filter = {
        ...filter,
        name: { $regex: name, $options: 'i' },
      };
    }

    try {
      const customMenuCompositions = await prisma.customMenuComposition.findMany({
        where: { restaurantId, ...filter },
        take: numberedLimit,
        skip: numberedLimit * (numberedPage - 1),
      });
      const countCustomMenuCompositions = await prisma.customMenuComposition.count({
        where: { restaurantId, ...filter },
      });
      const totalPages = Math.ceil(countCustomMenuCompositions / numberedLimit);

      if (numberedPage !== 1 && numberedPage > totalPages) {
        throw new BadRequest('Input page is bigger than total pages. Please check your page query.');
      }

      const result: DTO.GetCustomMenuCompositionsWithPaginated = {
        customMenuCompositions: customMenuCompositions.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
        })),
        pages: totalPages,
        total: countCustomMenuCompositions,
      }
      return result;
    } catch (error: any) {
      throw error;
    }
  };

const createCustomMenuComposition = async (req: Request):
  Promise<DTO.CustomMenuCompositionResponse['id'] | Error> => {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
    try {
      const body =
        DTO.customMenuCompositionBodySchema.parse(req.body);

      const customMenuCategoryExist = await prisma.customMenuCategory.findUnique({
        where: { id: body.customMenuCategoryId, restaurantId },
      });

      if (!customMenuCategoryExist) {
        throw new NotFound('Custom Menu category id is not found. Please input valid category custom menu id.');
      }

      const createdCustomMenuComposition = await prisma.customMenuComposition.create({
        data: {
          restaurantId,
          customMenuCategoryId: customMenuCategoryExist.id,
          name: body.name,
          description: body.description,
          stock: body.stock,
          price: body.price,
          image1: body.images[0] as string,
          image2: body.images[1] ?? null,
        }
      });
      return createdCustomMenuComposition.id;
    } catch (error: any) {
      throw error;
    }
  };

const getSpecificCustomMenuComposition = async (req: Request):
  Promise<DTO.CustomMenuCompositionResponse | Error> => {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
    try {
      const { compositionId } = req.params;
      const customMenuComposition = await prisma.customMenuComposition.findUnique({
        where: { id: compositionId, restaurantId },
      });

      if (!customMenuComposition) {
        throw new NotFound('Composition custom menu id not found. Please input valid custom menu composition id.');
      }

      const result: DTO.CustomMenuCompositionResponse = {
        id: customMenuComposition.id,
        name: customMenuComposition.name,
        customMenuCategoryId: customMenuComposition.customMenuCategoryId.toString(),
        description: customMenuComposition.description,
        images: [
          customMenuComposition.image1,
          customMenuComposition.image2,
        ],
        price: customMenuComposition.price,
        stock: customMenuComposition.stock,
      };

      return result;
    } catch (error: any) {
      throw error;
    }
  };

const updateCustomMenuComposition = async (req: Request):
  Promise<DTO.CustomMenuCompositionResponse['id'] | Error> => {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
    try {
      const { compositionId } = req.params;
      if (!compositionId) {
        throw new BadRequest('Invalid Request. Composistion id is undefined. Please check your input data.');
      }

      const body: DTO.CustomMenuCompositionBody = 
        DTO.customMenuCompositionBodySchema.parse(req.body);

      const customMenuCategoryExist = await prisma.customMenuCategory.findUnique({
        where: { id: body.customMenuCategoryId, restaurantId },
      });

      if (!customMenuCategoryExist) {
        throw new NotFound('Custom Menu category id is not found. Please input valid category custom menu id.');
      }

      const updatedCustomMenuComposition = await prisma.customMenuComposition.update({
        where: { id: compositionId, restaurantId },
        data: {
          name: body.name,
          description: body.description,
          stock: body.stock,
          price: body.price,
          image1: body.images[0] as string,
          image2: body.images[1] ?? null,
        },
      });

      if (!updatedCustomMenuComposition) {
        throw new NotFound('Custom Menu category id is not found. Please input valid category custom menu id.');
      }

      return updatedCustomMenuComposition.id;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Custom Menu Category Id not found. Please input valid custom menu cateogry id.');
      }
      throw error;
    }
  };

const deleteCustomMenuComposition = async (req: Request):
  Promise<DTO.CustomMenuCompositionResponse['id'] | Error> => {
    const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
    try {
      const { compositionId } = req.params;

      const deletedCustomMenuComposition = await prisma.customMenuComposition.delete({
        where: { id: compositionId, restaurantId },
      });

      if (!deletedCustomMenuComposition) {
        throw new NotFound('Composition custom menu id not found. Please input valid custom menu composition id.');
      }

      return deletedCustomMenuComposition.id;
    } catch (error: any) {
      throw error;
    }
  };

export {
  getAllCustomMenuCategory,
  createCustomMenuCategory,
  getSpecificCustomMenuCategory,
  updateCustomMenuCategory,
  deleteCustomMenuCategory,
  getAllCustomMenuComposition,
  createCustomMenuComposition,
  getSpecificCustomMenuComposition,
  updateCustomMenuComposition,
  deleteCustomMenuComposition,
};

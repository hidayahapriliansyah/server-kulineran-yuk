import { Request } from 'express';
import { z } from 'zod';

import CustomMenuCategory, { ICustomMenuCategory } from '../../../../models/CustomMenuCategory';
import { IRestaurant } from '../../../../models/Restaurant';
import CustomMenuCategorySpicyLevel from '../../../../models/CustomMenuCategorySpicyLevel';
import { BadRequest, NotFound } from '../../../../errors';
import CustomMenuComposition, { ICustomMenuComposition } from '../../../../models/CustomMenuComposition';
import convertImageGallery from '../../../../utils/convertImageGallery';

import * as DTO from './types';

const getAllCustomMenuCategory = async (req: Request):
  Promise<Pick<DTO.CustomMenuCategoryResponse, '_id' | 'name'>[] | Error> => {
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
  try {
    const customMenuCategories = await CustomMenuCategory.find({
      restaurantId
    });

    const result: Pick<DTO.CustomMenuCategoryResponse, '_id' | 'name'>[] =
      customMenuCategories.map((item) => ({
        _id: item._id,
        name: item.name,
      }));
    return result;
  } catch (error: any) {
    throw error;
  }
  };

const createCustomMenuCategory = async (req: Request): Promise<ICustomMenuCategory['_id'] | Error> => {
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
  try {
    const body: DTO.CustomMenuCategoryBody =
      DTO.customMenuCategoryBodySchema.parse(req.body);

    const { name, isBungkusAble, maxSpicy } = body;
    const customMenuCategory = await CustomMenuCategory.create({
      restaurantId,
      name,
      isBungkusAble,
    });

    if (maxSpicy) {
      await CustomMenuCategorySpicyLevel.create({
        customMenuCategoryId: customMenuCategory._id,
        maxSpicy,
      });
    }

    const { _id: result } = customMenuCategory;
    return result;
  } catch (error: any) {
    throw error;
  }
};

const getSpecificCustomMenuCategory = async (req: Request): Promise<DTO.CustomMenuCategoryResponse | Error> => {
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
  try {
    const { categoryId } = req.params;

    const customMenuCategory = await CustomMenuCategory.findOne({
      _id: categoryId,
      restaurantId,
    });

    if (!customMenuCategory) {
      throw new NotFound('Custom Menu category id is not found. Please input valid category custom menu id.');
    }
    
    const customMenuCategorySpicyLevelExist = await CustomMenuCategorySpicyLevel.findOne({
      customMenuCategoryId: categoryId,
    });

    const maxSpicy =
      customMenuCategorySpicyLevelExist
        ? customMenuCategorySpicyLevelExist.maxSpicy
        : null;

    const result: DTO.CustomMenuCategoryResponse = {
      _id: customMenuCategory._id,
      name: customMenuCategory.name,
      isBungkusAble: customMenuCategory.isBungkusAble,
      maxSpicy,
    };
    
    return result;
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw new NotFound('Custom Menu category id is not found. Please input valid category custom menu id.');
    }
    throw error;
  }
};

const updateCustomMenuCategory = async (req: Request):
  Promise<DTO.CustomMenuCategoryResponse['_id'] | Error> => {
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      throw new BadRequest('Invalid Request. Category id is undefined. Please check your input data.');
    }

    const body: DTO.CustomMenuCategoryBody =
      DTO.customMenuCategoryBodySchema.parse(req.body);

    const updatedCustomMenuCategory = await CustomMenuCategory
      .findOneAndUpdate({ _id: categoryId, restaurantId }, {
        name: body.name,
        isBungkusAble: body.isBungkusAble,
      });
    if (!updatedCustomMenuCategory) {
      throw new NotFound('Menu Id not found. Please input valid id menu.');
    }

    const customMenuCategoryHasSpicyLevel =
      await CustomMenuCategorySpicyLevel.findOne({ customMenuCategoryId: categoryId });
    if (customMenuCategoryHasSpicyLevel && body.maxSpicy) {
      await CustomMenuCategorySpicyLevel
        .findOneAndUpdate({ customMenuCategoryId: categoryId }, {
          maxSpicy: body.maxSpicy,
        });
    } else if (customMenuCategoryHasSpicyLevel && !body.maxSpicy) {
      await CustomMenuCategorySpicyLevel
        .findOneAndDelete({ customMenuCategoryId: categoryId });
    } else if ((!customMenuCategoryHasSpicyLevel && body.maxSpicy)) {
      await CustomMenuCategorySpicyLevel.create({
        customMenuCategoryId: categoryId, 
        maxSpicy: body.maxSpicy,
      });
    }

    return updatedCustomMenuCategory._id;
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw new NotFound('Custom Menu category id is not found. Please input valid category custom menu id.');
    }
    throw error;
  }
  };

const deleteCustomMenuCategory = async (req: Request):
  Promise<DTO.CustomMenuCategoryResponse['_id'] | Error> => {
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      throw new BadRequest('Invalid Request. Category id is undefined. Please check your input data.');
    }

    const customMenuCategoryHasComponentCustomMenu =
      await CustomMenuComposition.findOne({ customMenuCategoryId: categoryId });
    if (customMenuCategoryHasComponentCustomMenu) {
      throw new BadRequest('Custom Menu Category has at least one composition. Category can not be deleted. Please make sure there is no composition with this category to delete it.');
    }

    const customMenuCategoryHasSpicyLevel =
      await CustomMenuCategorySpicyLevel.findOne({ customMenuCategoryId: categoryId });
    if (customMenuCategoryHasSpicyLevel) {
      await CustomMenuCategorySpicyLevel.findOneAndDelete({ customMenuCategoryId: categoryId });
    }

    const deletedCustomMenuCategory =
      await CustomMenuCategory.findOneAndDelete({
        _id: categoryId,
        restaurantId,
      });
    if (!deletedCustomMenuCategory) {
      throw new NotFound('Menu Id not found. Please input valid id menu.');
    }
    const { _id: result } = deletedCustomMenuCategory;
    return result;
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw new NotFound('Custom Menu category id is not found. Please input valid category custom menu id.');
    }
    throw error;
  }
  };

const getAllCustomMenuComposition = async (req: Request):
  Promise<DTO.GetCustomMenuCompositionsWithPaginated | Error>=> {
    const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
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
      const customMenuCompositions =
        await CustomMenuComposition.find({ restaurantId, ...filter })
          .limit(numberedLimit)
          .skip(numberedLimit * (numberedPage - 1));
      const count = await CustomMenuComposition.countDocuments({ restaurantId, ...filter });
      const totalPages = Math.ceil(count / numberedLimit);

      if (numberedPage !== 1 && numberedPage > totalPages) {
        throw new BadRequest('Input page is bigger than total pages. Please check your page query.');
      }

      const result: DTO.GetCustomMenuCompositionsWithPaginated = {
        customMenuCompositions: customMenuCompositions.map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
        })),
        pages: totalPages,
        total: count,
      }
      return result;
    } catch (error: any) {
      throw error;
    }
  };

const createCustomMenuComposition = async (req: Request):
  Promise<DTO.CustomMenuCompositionResponse['_id'] | Error> => {
    const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] }
    try {
      const body =
        DTO.customMenuCompositionBodySchema.parse(req.body);

      const customMenuCategoryExist =
        await CustomMenuCategory.findOne({ _id: body.customMenuCategoryId, restaurantId });

      if (!customMenuCategoryExist) {
        throw new NotFound('Custom Menu category id is not found. Please input valid category custom menu id.');
      }
      
      const createdCustomMenuComposition =
        await CustomMenuComposition.create({
          restaurantId,
          customMenuCategoryId: customMenuCategoryExist._id,
          name: body.name,
          description: body.name,
          stock: body.stock,
          price: body.price,
          ...(convertImageGallery({
            arrayOfImageUrl: body.images,
            maxImage: 2,
          })),
        });
        const { _id: result } = createdCustomMenuComposition;
        return result;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Custom Menu category id is not found. Please input valid category custom menu id.');
      }
      throw error;
    }
  };

const getSpecificCustomMenuComposition = async (req: Request):
  Promise<DTO.CustomMenuCompositionResponse | Error> => {
    const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
    try {
      const { compositionId } = req.params;
      const customMenuComposition =
        await CustomMenuComposition.findOne({ _id: compositionId, restaurantId });

      if (!customMenuComposition) {
        throw new NotFound('Composition custom menu id not found. Please input valid custom menu composition id.');
      }

      const result: DTO.CustomMenuCompositionResponse = {
        _id: customMenuComposition._id,
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
      if (error.name === 'CastError') {
        throw new NotFound('Custom Menu Category Id not found. Please input valid custom menu cateogry id.');
      }
      throw error;
    }
  };

const updateCustomMenuComposition = async (req: Request):
  Promise<DTO.CustomMenuCompositionResponse['_id'] | Error> => {
    const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
    try {
      const { compositionId } = req.params;
      if (!compositionId) {
        throw new BadRequest('Invalid Request. Composistion id is undefined. Please check your input data.');
      }

      const body: DTO.CustomMenuCompositionBody = 
        DTO.customMenuCompositionBodySchema.parse(req.body);
      
      const customMenuCategoryExist =
        await CustomMenuCategory.findOne({ _id: body.customMenuCategoryId, restaurantId });

      if (!customMenuCategoryExist) {
        throw new NotFound('Custom Menu category id is not found. Please input valid category custom menu id.');
      }

      const updatedCustomMenuComposition = 
        await CustomMenuComposition.findOneAndUpdate({ _id: compositionId, restaurantId }, {
          customMenuCategoryId: customMenuCategoryExist._id,
          name: body.name,
          description: body.name,
          stock: body.stock,
          price: body.price,
          ...(convertImageGallery({
            arrayOfImageUrl: body.images,
            maxImage: 2,
          })),
        });

      if (!updatedCustomMenuComposition) {
        throw new NotFound('Custom Menu category id is not found. Please input valid category custom menu id.');
      }
      const { _id: result } = updatedCustomMenuComposition;
      return result;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Custom Menu Category Id not found. Please input valid custom menu cateogry id.');
      }
      throw error;
    }
  };

const deleteCustomMenuComposition = async (req: Request):
  Promise<DTO.CustomMenuCompositionResponse['_id'] | Error> => {
    const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
    try {
      const { compositionId } = req.params;

      const deletedCustomMenuComposition =
        await CustomMenuComposition.findOneAndDelete({
          _id: compositionId,
          restaurantId,
        });

      if (!deletedCustomMenuComposition) {
        throw new NotFound('Composition custom menu id not found. Please input valid custom menu composition id.');
      }

      const { _id: result } = deletedCustomMenuComposition;
      return result;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Custom Menu Category Id not found. Please input valid custom menu cateogry id.');
      }
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
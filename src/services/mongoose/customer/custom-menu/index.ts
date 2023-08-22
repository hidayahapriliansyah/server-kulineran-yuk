import { Request } from 'express';

import { ICustomer } from '../../../../models/Customer';
import CustomMenu, { ICustomMenu } from '../../../../models/CustomMenu';
import { IRestaurant } from '../../../../models/Restaurant';
import * as DTO from './types';
import db from '../../../../db';
import PickedCustomMenuComposition from '../../../../models/PickedCustomMenuComposition';
import CustomMenuComposition, { ICustomMenuComposition } from '../../../../models/CustomMenuComposition';
import { BadRequest, NotFound } from '../../../../errors';
import CustomMenuCategory, { ICustomMenuCategory } from '../../../../models/CustomMenuCategory';

const getAllCustomMenu = async (req: Request):
  Promise<DTO.GetAllCustomMenuResponse | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    try {
      const customMenus = await CustomMenu.find({ customerId })
        .populate({
          path: 'restaurantId',
          select: '_id username name avatar',
        });

      const result: DTO.GetAllCustomMenuResponse = 
        customMenus.map((customMenu) => ({
          _id: customMenu._id,
          createdAt: customMenu.createdAt,
          name: customMenu.name,
          image: (customMenu.restaurantId as IRestaurant).avatar,
          restaurant: {
            _id: (customMenu.restaurantId as IRestaurant)._id,
            name: (customMenu.restaurantId as IRestaurant).name,
            username: (customMenu.restaurantId as IRestaurant).username,
          }
        }));
      
      return result;
    } catch (error: any) {
      throw error;
    }
  };

const createCustomMenu = async (req: Request):
  Promise<DTO.CustomMenuResponse['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    
    const body: DTO.CreateCustomMenuRequestBody = 
      DTO.createCustomMenuRequestBodySchema.parse(req.body);
    // hitung total harga custom menu x qty dari daftar picked custom menu
    let totalPrice = 0;
    await Promise.all(body.pickedCustomMenuComposition.map(async (pickedComposition) => {
      try {
        const composition = await CustomMenuComposition.findById(pickedComposition._id);
        if (!composition) {
          throw new NotFound('customMenuCompositionId is not found. Please input valid customMenuCompositionId.');
        }
        totalPrice += (composition.price * pickedComposition.qty);
      } catch (error: any) {
        if (error.name === 'CastError') {
          throw new NotFound('customMenuCompositionId is not found. Please input valid customMenuCompositionId.');
        }
        throw error;
      }
    }));

    try {
      const existCustomMenuCategory = await CustomMenuCategory.findById(body.customMenuCategoryId);
      if (!existCustomMenuCategory) {
        throw new NotFound('customMenuCategoryId is not found. Please input valid customMenuCategoryId.');
      }
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('customMenuCategoryId is not found. Please input valid customMenuCategoryId.');
      }
      throw error;
    }

    const session = await db.startSession();
    try {
      session.startTransaction();
      const createdCustomMenu = await CustomMenu.create({
        customerId,
        restaurantId: body.restaurantId,
        customMenuCategoryId: body.customMenuCategoryId,
        name: body.name,
        price: totalPrice,
      });
      body.pickedCustomMenuComposition.forEach(async (composition) => {
        await PickedCustomMenuComposition.create({
          customMenuId: createdCustomMenu._id,
          customMenuCompositionId: composition._id,
          qty: composition.qty,
        });
      });
      session.commitTransaction();
      session.endSession();

      const { _id: result } = createdCustomMenu;
      return result;
    } catch (error: any) {
      session.abortTransaction();
      session.endSession();
      throw error;
    }
  };

const getCustomMenuById = async (req: Request):
  Promise<DTO.CustomMenuResponse | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    try {
      const { customMenuId } = req.params;

      const customMenu = await CustomMenu.findOne({ _id: customMenuId, customerId })
        .populate([
          { path: 'restaurantId', select: '_id username name avatar' },
          { path: 'customMenuCategoryId', select: '_id name isBungkusAble' },
        ]);
      if (!customMenu) {
        throw new NotFound('Custom Menu Id not found. Please input valid custom menu id.');
      }
      const pickedCustomMenuCompositions =
        await PickedCustomMenuComposition.find({ customMenuId })
          .populate({
            path: 'customMenuCompositionId',
            select: '_id name image1 price',
          });

      const result: DTO.CustomMenuResponse = {
        _id: customMenu._id,
        createdAt: customMenu.createdAt,
        name: customMenu.name,
        image: (customMenu.restaurantId as IRestaurant)?.avatar,
        customMenuCategory: {
          _id: (customMenu.customMenuCategoryId as ICustomMenuCategory)?._id,
          name: (customMenu.customMenuCategoryId as ICustomMenuCategory)?.name,
          isBungkusAble: (customMenu.customMenuCategoryId as ICustomMenuCategory)?.isBungkusAble,
        },
        restaurant: {
          _id: (customMenu.restaurantId as IRestaurant)?._id,
          username: (customMenu.restaurantId as IRestaurant)?.username,
          name: (customMenu.restaurantId as IRestaurant)?.name,
        },
        pickedCustomMenuCompositions:
          pickedCustomMenuCompositions.map((composition) => ({
            _id: composition._id,
            customMenuComposition: {
              _id: (composition.customMenuCompositionId as ICustomMenuComposition)?._id,
              image: (composition.customMenuCompositionId as ICustomMenuComposition)?.image1,
              name: (composition.customMenuCompositionId as ICustomMenuComposition)?.name,
              price: (composition.customMenuCompositionId as ICustomMenuComposition)?.price,
            },
            qty: composition.qty,
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
  Promise<DTO.CustomMenuResponse['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    const { customMenuId } = req.params;
    if (!customMenuId) {
      throw new BadRequest('Invalid input. customMenuId param is missing.');
    }

    const body: DTO.UpdateCustomMenuRequestBody = 
      DTO.updateCustomMenuRequestBodySchema.parse(req.body);

    let totalPrice = 0;
    await Promise.all(body.pickedCustomMenuComposition.map(async (pickedComposition) => {
      try {
        const composition = await CustomMenuComposition.findById(pickedComposition._id);
        if (!composition) {
          throw new NotFound('customMenuCompositionId is not found. Please input valid customMenuCompositionId.');
        }
        const { price } = composition;
        totalPrice += (pickedComposition.qty * price);
      } catch (error: any) {
        if (error.name === 'CastError') {
          throw new NotFound('customMenuCompositionId is not found. Please input valid customMenuCompositionId.');
        }
        throw error;
      }
    }));

    const session = await db.startSession();
    try {
      session.startTransaction();
      const updatedCustomMenu = await CustomMenu.findOneAndUpdate(
        { _id: customMenuId, customerId },
        { name: body.name, price: totalPrice },
      );
      if (!updatedCustomMenu) {
        throw new NotFound('Custom Menu Id not found. Please input valid custom menu id.');
      }
      await PickedCustomMenuComposition.deleteMany({ customMenuId: updatedCustomMenu._id });
      body.pickedCustomMenuComposition.forEach(async (composition) => {
        await PickedCustomMenuComposition.create({
          customMenuId,
          customMenuCompositionId: composition._id,
          qty: composition.qty,
        });
      });
      session.commitTransaction();
      session.endSession();

      const { _id: result } = updatedCustomMenu as ICustomMenu;
      return result;
    } catch (error: any) {
      session.abortTransaction();
      session.endSession();
      if (error.name === 'CastError') {
        throw new NotFound('Custom Menu Id not found. Please input valid custom menu id.');
      }
      throw error;
    }
  };

const deleteCustomMenu = async (req: Request):
  Promise<DTO.CustomMenuResponse['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    const { customMenuId } = req.params;
    if (!customMenuId) {
      throw new BadRequest('Invalid input. customMenuId param is missing.');
    }

    const session = await db.startSession();
    try {

      session.startTransaction();
      const deletedCustomMenu =
        await CustomMenu.findOneAndDelete({ _id: customMenuId, customerId });
      if (!deletedCustomMenu) {
        throw new NotFound('Custom Menu Id not found. Please input valid custom menu id.');
      }
      await PickedCustomMenuComposition.deleteMany({ customMenuId });
      session.commitTransaction();
      session.endSession();

      const { _id: result } = deletedCustomMenu;
      return result;
    } catch (error: any) {
      session.commitTransaction();
      session.endSession();
      if (error.name === 'CastError') {
        throw new NotFound('Custom Menu Id not found. Please input valid custom menu id.');
      }
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

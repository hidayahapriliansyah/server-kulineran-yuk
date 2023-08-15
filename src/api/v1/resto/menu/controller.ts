import { Request, Response, NextFunction } from 'express';
import { SuccessAPIResponse } from '../../../../global/types';
import { StatusCodes } from 'http-status-codes';
import { IEtalase } from '../../../../models/Etalase';
import {
  createEtalase,
  createRestaurantMenu,
  deleteEtalase,
  deleteRestaurantMenu,
  getAllEtalase,
  getAllRestaurantMenu,
  getRestaurantMenuBySlug,
  updateEtalase,
  updateRestaurantMenu
} from '../../../../services/mongoose/resto/menus';
import { IMenu } from '../../../../models/Menu';

import * as DTO from '../../../../services/mongoose/resto/menus/types';

const getAllEtalaseController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAllEtalase(req);
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Success to get menus data.', result));
  } catch (error: any) {
    next(error);
  }
};

const createEtalaseController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await createEtalase(req) as IEtalase['_id'];
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Success to create etalase', { etalaseId: result }));
  } catch (error: any) {
    next(error);
  }
};

const updateEtalaseController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await updateEtalase(req) as IEtalase['_id'];
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to update etalase', { etalaseId: result }))
  } catch (error: any) {
    next(error);
  }
};

const deleteEtalaseController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await deleteEtalase(req) as IEtalase['_id'];
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to delete etalase', { etalaseId: result }));
  } catch (error: any) {
    next(error);
  }
};

const getAllRestaurantMenuController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAllRestaurantMenu(req) as DTO.GetMenusWithPaginated;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to get menus data.', {
        menus: result.menus,
        pages: result.pages,
        total: result.total,
      }));
  } catch (error: any) {
    next(error);
  }
};

const createRestaurantMenuController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = createRestaurantMenu(req);

    res
      .status(201)
      .json(new SuccessAPIResponse('Creating menu successfully', { menuId: result }));
  } catch (error: any) {
    next(error);
  }
};

const getRestaurantMenuBySlugController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to get menu data', result));
  } catch (error: any) {
    next(error);
  }
};

const updateRestaurantMenuController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await updateRestaurantMenu(req) as IMenu['_id'];
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating menu successfully', {
        menuId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const deleteRestaurantMenuController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await deleteRestaurantMenu(req) as IMenu['_id'];
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Deleting menu successfully', {
        menuId: result
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  createEtalaseController,
  getAllEtalaseController,
  updateEtalaseController,
  deleteEtalaseController,
  createRestaurantMenuController,
  getAllRestaurantMenuController,
  getRestaurantMenuBySlugController,
  updateRestaurantMenuController,
  deleteRestaurantMenuController,
};
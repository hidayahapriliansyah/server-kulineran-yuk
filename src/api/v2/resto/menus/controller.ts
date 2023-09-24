import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Etalase, Menu } from '@prisma/client';
import { SuccessAPIResponse } from '../../../../global/types';

import * as menuService from '../../../../services/prisma/resto/menus';
import * as DTO from '../../../../services/prisma/resto/menus/types';

const getAllEtalase = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await menuService.getAllEtalase(req);
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Success to get elatase data.', result));
  } catch (error: any) {
    next(error);
  }
};

const createEtalase = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await menuService.createEtalase(req) as Etalase['id'];

    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Success to create etalase', { etalaseId: result }));
  } catch (error: any) {
    next(error);
  }
};

const updateEtalase = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await menuService.updateEtalase(req) as Etalase['id'];
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to update etalase', { etalaseId: result }))
  } catch (error: any) {
    next(error);
  }
};

const deleteEtalase = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await menuService.deleteEtalase(req) as Etalase['id'];
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to delete etalase', { etalaseId: result }));
  } catch (error: any) {
    next(error);
  }
};

const getAllRestaurantMenu = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await menuService.getAllRestaurantMenu(req) as DTO.GetMenusWithPaginated;

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

const createRestaurantMenu = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = menuService.createRestaurantMenu(req);

    res
      .status(201)
      .json(new SuccessAPIResponse('Creating menu successfully.', { menuId: result }));
  } catch (error: any) {
    next(error);
  }
};

const getRestaurantMenuBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await menuService.getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to get menu data.', result));
  } catch (error: any) {
    next(error);
  }
};

const updateRestaurantMenu = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await menuService.updateRestaurantMenu(req) as Menu['id'];
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating menu successfully.', {
        menuId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const deleteRestaurantMenu = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await menuService.deleteRestaurantMenu(req) as Menu['id'];
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Deleting menu successfully.', {
        menuId: result
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getAllEtalase,
  createEtalase,
  updateEtalase,
  deleteEtalase,
  getAllRestaurantMenu,
  createRestaurantMenu,
  getRestaurantMenuBySlug,
  updateRestaurantMenu,
  deleteRestaurantMenu,
};

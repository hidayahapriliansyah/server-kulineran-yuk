import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import { CustomMenuCategory } from '@prisma/client';
import * as customMenuService from '../../../../services/prisma/resto/custom-menu';
import * as DTO from '../../../../services/prisma/resto/custom-menu/types';

const getAllCustomMenuCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await customMenuService.getAllCustomMenuCategory(req) as Pick<DTO.CustomMenuCategoryResponse, 'id' | 'name'>[];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to get custom menus data.', result));
  } catch (error: any) {
    next(error);
  }
};

const createCustomMenuCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await customMenuService.createCustomMenuCategory(req) as CustomMenuCategory['id'];
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Creating menu successfully', {
        customMenuCategoryId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getSpecificCustomMenuCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await customMenuService.getSpecificCustomMenuCategory(req) as DTO.CustomMenuCategoryResponse;

    res 
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to get custom menu category data.', result));
  } catch (error: any) {
    next(error);
  }
};

const updateCustomMenuCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await customMenuService.updateCustomMenuCategory(req) as DTO.CustomMenuCategoryResponse['id'];

    res 
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating category custom menu successfully.', {
        customMenuCategoryId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const deleteCustomMenuCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await customMenuService.deleteCustomMenuCategory(req) as DTO.CustomMenuCategoryResponse['id'];

    res 
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to delete custom menu category data.', {
        customMenuCategoryId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getAllCustomMenuComposition = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await customMenuService.getAllCustomMenuComposition(req) as DTO.GetCustomMenuCompositionsWithPaginated;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to get custom menu compositions data.', {
        customMenuCompositions: result.customMenuCompositions,
        pages: result.pages,
        total: result.total,
      }));
  } catch (error: any) {
    next(error);
  }

};

const createCustomMenuComposition = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await customMenuService.createCustomMenuComposition(req) as DTO.CustomMenuCompositionResponse['id'];

    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Creating menu successfully', {
        customMenuCategoryId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getSpecificCustomMenuComposition = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await customMenuService.getSpecificCustomMenuComposition(req) as DTO.CustomMenuCompositionResponse;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get custom menu composition successfully', result));
  } catch (error: any) {
    next(error);
  }
};

const updateCustomMenuComposition = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await customMenuService.updateCustomMenuComposition(req) as DTO.CustomMenuCompositionResponse['id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating custom menu composition successfully', {
        customMenuCategoryId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const deleteCustomMenuComposition = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await customMenuService.deleteCustomMenuComposition(req) as DTO.CustomMenuCompositionResponse['id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Deleting custom menu composition successfully', {
        customMenuCategoryId: result,
      }));
  } catch (error: any) {
    next(error);
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

import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../../../../global/types';
import { ICustomMenuCategory } from '../../../../models/CustomMenuCategory';
import {
  CustomMenuCategoryResponseDTO,
  CustomMenuCompositionResponseDTO,
  GetCustomMenuCompositionsWithPaginated,
  createCustomMenuCategory,
  createCustomMenuComposition,
  deleteCustomMenuCategory,
  deleteCustomMenuComposition,
  getAllCustomMenuCategory,
  getAllCustomMenuComposition,
  getSpecificCustomMenuCategory,
  getSpecificCustomMenuComposition,
  updateCustomMenuCategory,
  updateCustomMenuComposition,
} from '../../../../services/mongoose/resto/custom-menu';

const createCustomMenuCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await createCustomMenuCategory(req) as ICustomMenuCategory['_id'];
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Creating menu successfully', {
        customMenuCategoryId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getAllCustomMenuCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await getAllCustomMenuCategory(req) as Pick<CustomMenuCategoryResponseDTO, '_id' | 'name'>[];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to get custom menus data.', result));
  } catch (error: any) {
    next(error);
  }
};

const getSpecificCustomMenuCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getSpecificCustomMenuCategory(req) as CustomMenuCategoryResponseDTO;

    res 
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to get custom menu category data.', result));
  } catch (error: any) {
    next(error);
  }
};

const updateCustomMenuCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await updateCustomMenuCategory(req) as CustomMenuCategoryResponseDTO['_id'];

    res 
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating category custom menu successfully.', {
        customMenuCategoryId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const deleteCustomMenuCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await deleteCustomMenuCategory(req) as CustomMenuCategoryResponseDTO['_id'];

    res 
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Success to delete custom menu category data.', {
        customMenuCategoryId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getAllCustomMenuCompositionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await getAllCustomMenuComposition(req) as GetCustomMenuCompositionsWithPaginated;

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

const createCustomMenuCompositionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await createCustomMenuComposition(req) as CustomMenuCompositionResponseDTO['_id'];

    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Creating menu successfully', {
        customMenuCategoryId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const getSpecificCustomMenuCompositionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await getSpecificCustomMenuComposition(req) as CustomMenuCompositionResponseDTO;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get custom menu composition successfully', result));
  } catch (error: any) {
    next(error);
  }
};

const updateCustomMenuCompositionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await updateCustomMenuComposition(req) as CustomMenuCompositionResponseDTO['_id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating custom menu composition successfully', {
        customMenuCategoryId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const deleteCustomMenuCompositionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await deleteCustomMenuComposition(req) as CustomMenuCompositionResponseDTO['_id'];

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
  createCustomMenuCategoryController,
  getAllCustomMenuCategoryController,
  getSpecificCustomMenuCategoryController,
  updateCustomMenuCategoryController,
  deleteCustomMenuCategoryController,
  getAllCustomMenuCompositionController,
  createCustomMenuCompositionController,
  getSpecificCustomMenuCompositionController,
  updateCustomMenuCompositionController,
  deleteCustomMenuCompositionController,
};
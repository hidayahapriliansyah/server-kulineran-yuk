import { NextFunction, Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../../../../global/types';
import * as customMenuService from '../../../../services/mongoose/customer/custom-menu';
import * as DTO from '../../../../services/mongoose/customer/custom-menu/types';

const getAllCustomMenu = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await customMenuService.getAllCustomMenu(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Getting custom menu data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const createCustomMenu = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await customMenuService.createCustomMenu(req) as DTO.CustomMenuResponse['_id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Creating custom menu successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const getCustomMenuById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await customMenuService.getCustomMenuById(req) as DTO.CustomMenuResponse;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Getting custom menu data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const updateCustomMenu = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await customMenuService.updateCustomMenu(req) as DTO.CustomMenuResponse['_id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Update custom menu successfully.', {
        customMenuId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const deleteCustomMenu = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await customMenuService.deleteCustomMenu(req) as DTO.CustomMenuResponse['_id'];

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Delete custom menu successfully.', {
        customMenuId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  getAllCustomMenu,
  createCustomMenu,
  getCustomMenuById,
  updateCustomMenu,
  deleteCustomMenu,
};
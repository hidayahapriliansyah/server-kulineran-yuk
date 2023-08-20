import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as restaurantService from '../../../../services/mongoose/customer/restaurant'; 
import * as DTO from '../../../../services/mongoose/customer/restaurant/types'; 

const findRestaurantByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result =
      await restaurantService.findRestaurantByUsername(req) as DTO.FindRestaurantResponse;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Find restaurant successfully', result))

  } catch (error: any) {
    next(error);
  }
};

const getRestaurantProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await restaurantService.getRestaurantProfile(req) as DTO.RestaurantProfileResponse;

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get restaurant profile data successfully', result));
  } catch (error: any) {
    next(error);
  }
};

const getAllRestaurantMenus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await restaurantService.getAllRestaurantMenus(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get restaurant menus data successfully', result));
  } catch (error: any) {
    next(error);
  }
};

const getAllRestaurantReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await restaurantService.getAllRestaurantReviews(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get restaurant menus data successfully', result));
  } catch (error: any) {
    next(error);
  }
};

const createRestaurantReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await restaurantService.createRestaurantReviews(req);

    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Creating review successfully', {
        reviewId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const updateRestaurantReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await restaurantService.updateRestaurantReviews(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Updating review successfully', {
        reviewId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const deleteRestaurantReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await restaurantService.deleteRestaurantReviews(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Deleting review successfully', {
        reviewId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export {
  findRestaurantByUsername,
  getRestaurantProfile,
  getAllRestaurantMenus,
  getAllRestaurantReviews,
  createRestaurantReviews,
  updateRestaurantReviews,
  deleteRestaurantReviews,
};

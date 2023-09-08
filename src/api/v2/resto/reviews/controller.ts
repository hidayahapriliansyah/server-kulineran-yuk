import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessAPIResponse } from '../../../../global/types';
import * as reviewService from '../../../../services/prisma/resto/reviews';

const getAllRestaurantReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await reviewService.getAllRestaurantReviews(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Getting reviews restaurant data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const getDetailReviewById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await reviewService.getDetailReviewById(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Get a review data successfully.', result));
  } catch (error: any) {
    next(error);
  }
};

const createReviewResponse = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await reviewService.createReviewResponse(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Reply a review successfully.', {
        responseId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const updateReviewResponse = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await reviewService.updateReviewResponse(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Update reply a review successfully.', {
        responseId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const deleteReviewResponse = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await reviewService.deleteReviewResponse(req);

    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Delete reply of restaurant review successfully.', {
        responseId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};


export {
  getAllRestaurantReviews,
  getDetailReviewById,
  createReviewResponse,
  updateReviewResponse,
  deleteReviewResponse,
};

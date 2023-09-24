import { Request } from 'express';

import * as DTO from './types';
import { Prisma, Restaurant, RestaurantReviewResponse } from '@prisma/client';
import { BadRequest, NotFound } from '../../../../errors';
import prisma from '../../../../db';

const getAllRestaurantReviews = async (
  req: Request
): Promise<DTO.GetAllRestaurantReviewsResponse | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  const { rating, isReplied, page = '1' } = req.query as {
    rating?: string,
    isReplied?: string,
    page?: string,
  };

  const numberedLimit = 10;
  const numberedPage = Number(page);
  if (isNaN(numberedPage)) {
    throw new BadRequest('page query is not number.');
  }

  let reviewWhereInput: Prisma.RestaurantReviewWhereInput = {};
  if (rating) {
    if (!['1', '2', '3', '4', '5'].includes(rating)) {
      throw new BadRequest('rating query is not valid.');
    }
    const numberedRating = Number(rating);
    reviewWhereInput = { ...reviewWhereInput, rating: numberedRating };
  }
  if (isReplied) {
    if (!['0', '1'].includes(isReplied)) {
      throw new BadRequest('isReplied query is not valid.');
    }
    const isRepliedBoolean = Boolean(Number(isReplied));
    reviewWhereInput = { ...reviewWhereInput, isReplied: isRepliedBoolean };
  }

  const foundReviews = await prisma.restaurantReview.findMany({
    where: { ...reviewWhereInput, restaurantId },
    include: {
      customer: {
        select: {
          username: true,
        },
      },
    },
    take: numberedLimit,
    skip: numberedLimit * (numberedPage - 1),
  });

  const countReviews = await prisma.restaurantReview.count({
    where: { ...reviewWhereInput, restaurantId },
  });
  const totalPages = Math.ceil(countReviews / numberedLimit);

  const result: DTO.GetAllRestaurantReviewsResponse = {
    reviews: foundReviews.map((review) => ({
      id: review.id,
      createdAt: review.createdAt,
      customer: {
        username: review.customer.username,
      },
      rating: review.rating,
      reviewDescription: review.reviewDescription,
    })),
    page: totalPages,
    total: countReviews,
  };
  return result;
};

const getDetailReviewById = async (
  req: Request,
): Promise<DTO.GetDetailReviewByIdResponse | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  const { reviewId } = req.params;

  const foundReview = await prisma.restaurantReview.findUnique({
    where: { id: reviewId, restaurantId },
    include: {
      customer: {
        select: {
          username: true,
          name: true,
        },
      },
      response: true,
    },
  });
  if (!foundReview) {
    throw new NotFound('Review is not found.');
  }

  const result: DTO.GetDetailReviewByIdResponse = {
    id: foundReview.id,
    createdAt: foundReview.createdAt,
    customer: {
      username: foundReview.customer.username,
      name: foundReview.customer.name,
    },
    rating: foundReview.rating,
    hasCustomerBeenShoppingHere: foundReview.hasCustomerBeenShoppingHere,
    reviewDescription: foundReview.reviewDescription,
    isReplied: foundReview.isReplied,
    restaurantReviewResponse: foundReview.response
      ? {
        id: foundReview.response.id,
        createdAt: foundReview.response.createdAt,
        updatedAt: foundReview.response.updatedAt,
        responseDescription: foundReview.response.responseDescription,
      }
      : null
  };
  return result;
};

const createReviewResponse = async (
  req: Request,
): Promise<RestaurantReviewResponse['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  const { reviewId } = req.params;
  if (!reviewId) {
    throw new BadRequest('reviewId param is missing.');
  }

  const body: DTO.CreateUpdateReviewResponseBody =
    DTO.createUpdateReviewResponseBodySchema.parse(req.body);

  const foundReview = await prisma.restaurantReview.findUnique({
    where: { id: reviewId, restaurantId },
    include: {
      response: true,
    },
  });

  if (!foundReview) {
    throw new NotFound('Review is not found.');
  }

  if (foundReview.response) {
    throw new BadRequest('Review already has response. Fail to create response review.');
  }

  const createdReviewResponse = await prisma.restaurantReviewResponse.create({
    data: {
      restaurantReviewId: foundReview.id,
      responseDescription: body.responseDescription,
    },
  });
  return createdReviewResponse.id;
};

const updateReviewResponse = async (
  req: Request,
): Promise<RestaurantReviewResponse['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  const { responseId } = req.params;
  if (!responseId) {
    throw new BadRequest('responseId param is missing.');
  }

  const body: DTO.CreateUpdateReviewResponseBody =
    DTO.createUpdateReviewResponseBodySchema.parse(req.body);

  const foundReviewResponse = await prisma.restaurantReviewResponse.findUnique({
    where: { id: responseId },
    include: {
      restaurantReview: true,
    }
  });
  if (
    !foundReviewResponse ||
    (foundReviewResponse.restaurantReview.restaurantId !== restaurantId)
  ) {
    throw new NotFound('Review response is not found.');
  }

  const updatedReviewResponse = await prisma.restaurantReviewResponse.update({
    where: { id: responseId },
    data: { responseDescription: body.responseDescription },
  });
  return updatedReviewResponse.id;
};

const deleteReviewResponse = async (
  req: Request,
): Promise<RestaurantReviewResponse['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  const { responseId } = req.params;
  if (!responseId) {
    throw new BadRequest('responseId param is missing.');
  }

  const foundReviewResponse = await prisma.restaurantReviewResponse.findUnique({
    where: { id: responseId },
    include: {
      restaurantReview: true,
    }
  });
  if (!foundReviewResponse ||
    (foundReviewResponse.restaurantReview.restaurantId !== restaurantId)
  ) {
    throw new NotFound('Review response is not found.');
  }

  const deletedReviewResponse = await prisma.restaurantReviewResponse.delete({
    where: { id: foundReviewResponse.id },
  });
  return deletedReviewResponse.id;
};

export {
  getAllRestaurantReviews,
  getDetailReviewById,
  createReviewResponse,
  updateReviewResponse,
  deleteReviewResponse,
};

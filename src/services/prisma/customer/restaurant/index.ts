import { Request } from 'express';
import { capitalCase } from 'change-case';

import { BadRequest, NotFound } from '../../../../errors';
import prisma from '../../../../db';
import * as DTO from './types';
import checkRestaurantIsOpenNow from '../../../../utils/checkIsRestaurantOpenNow';
import { Customer } from '@prisma/client';
import updateRestaurantRating from '../../../../utils/updateRestaurantRating';

const findRestaurantByUsername = async (
  req: Request,
): Promise<DTO.FindRestaurantResponse | Error> => {
  const { restaurantUsername } = req.params;

  const foundRestaurant = await prisma.restaurant.findUnique({
    where: { username: restaurantUsername },
  });

  if (!foundRestaurant) {
    throw new NotFound('Restaurant is not Found.');
  }

  const result: DTO.FindRestaurantResponse = {
    id: foundRestaurant.id,
    avatar: foundRestaurant.avatar,
    username: foundRestaurant.username,
    name: foundRestaurant.name,
  };

  return result;
};

const getRestaurantProfile = async (
  req: Request,
): Promise<DTO.RestaurantProfileResponse | Error> => {
  const { restaurantUsername } = req.params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { username: restaurantUsername },
    include: { address: true },
  });

  if (!restaurant) {
    throw new NotFound('Restaurant is not Found.');
  }

  const restaurantDetailAddress = restaurant.address
    ? `${restaurant.address.detail}, ${capitalCase(restaurant.address.villageName as string)}, ${capitalCase(restaurant.address.districtName as string)}, ${capitalCase(restaurant.address.regencyName as string)}, ${capitalCase(restaurant.address.provinceName as string)}`
    : null;

  const isOpen = restaurant.openingHour && restaurant.closingHour
    ? checkRestaurantIsOpenNow({
        openingHour: restaurant.openingHour,
        closingHour: restaurant.closingHour,
        daysoff: restaurant.daysOff,
      })
    : null;

  const countRestaurantReview = await prisma.restaurantReview.count({
    where: { restaurantId: restaurant.id },
  });
  const result: DTO.RestaurantProfileResponse = {
    id: restaurant.id,
    username: restaurant.username,
    name: restaurant.name,
    avatar: restaurant.avatar,
    rating: {
      mean: restaurant.rating,
      totalReview: countRestaurantReview,
    },
    detail: {
      address: restaurantDetailAddress,
      openingHour: restaurant.openingHour,
      closingHour: restaurant.closingHour,
      contact: restaurant.contact,
      daysOff: restaurant.daysOff,
    },
    locationLink: restaurant.locationLink,
    gallery: [
      restaurant.image1,
      restaurant.image2,
      restaurant.image3,
      restaurant.image4,
      restaurant.image5,
    ],
    fasilities: restaurant.fasilities,
    isOpenNow: isOpen as (boolean | null),
  };

  return result;
};

const getAllRestaurantMenus = async (
  req: Request,
): Promise<DTO.GetAllRestaurantMenusResponse | Error> => {
  const { restaurantUsername } = req.params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { username: restaurantUsername },
  });
  if (!restaurant) {
    throw new NotFound('Restaurant is not Found.');
  }

  const {
    limit = '10',
    page = '1',
    sortBy = 'newest',
    etalaseId,
  } = req.query as {
    limit: string,
    page: string,
    sortBy: string,
    etalaseId: string,
  };

  const numberedLimit = Number(limit);
  const numberedPage = Number(page);

  if (isNaN(numberedLimit) || isNaN(numberedPage)) {
    throw new BadRequest('limit or page query is not number.');
  }

  if (!['newest', 'oldest', 'lowestprice', 'highestprice'].includes(sortBy)) {
    throw new BadRequest('sortBy query is not valid.');
  }

  let sort = {};
  if (sortBy === 'lowestprice') {
    sort = { price: 'asc' };
  } else if (sortBy === 'highestprice') {
    sort = { price: 'desc' };
  } else if (sortBy === 'oldest') {
    sort = { createdAt: 'asc' };
  } else {
    sort = { createdAt: 'desc' };
  }

  let filter = {};
  if (etalaseId) {
    const findEtalase = await prisma.etalase.findUnique({
      where: { id: etalaseId },
    });
    if (!findEtalase) {
    throw new NotFound('Etalase is not found.');
    }
    filter = { ...filter, etalaseId };
  }

  const menus = await prisma.menu.findMany({
    where: { restaurantId: restaurant.id , ...filter },
    take: numberedLimit,
    skip: numberedLimit * (numberedPage - 1),
  });

  const countMenus = await prisma.menu.count({ where: { restaurantId: restaurant.id , ...filter } });
  const totalPages = Math.ceil(countMenus / numberedLimit);

  if (numberedPage !== 1 && numberedPage > totalPages) {
    throw new BadRequest('Input page is bigger than total pages. Please check your page query.');
  }

  const result: DTO.GetAllRestaurantMenusResponse = {
    menus: menus.map((menu) => ({
      id: menu.id,
      slug: menu.slug,
      name: menu.name,
      image: menu.image1,
      price: menu.price,
    })),
    pages: totalPages,
    total: countMenus,
  };

  return result;
};

const getAllRestaurantReviews = async (
  req: Request,
): Promise<DTO.GetAllRestaurantReviewsResponse | Error> => {
  const { restaurantUsername } = req.params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { username: restaurantUsername },
  });
  if (!restaurant) {
    throw new NotFound('Restaurant is not Found.');
  }

  const {
    limit = '10',
    page = '1',
    sortBy = 'newest',
    rating,
  } = req.query as {
    limit: string,
    page: string,
    sortBy: string,
    rating: string,
  };

  const numberedLimit = Number(limit);
  const numberedPage = Number(page);

  if (isNaN(numberedLimit) || isNaN(numberedPage)) {
    throw new BadRequest('limit or page query is not number.');
  }

  if (!['newest', 'oldest', 'lowestrating', 'highestrating'].includes(sortBy)) {
    throw new BadRequest('sortBy query is not valid.');
  }

  let sort: {
    [key in 'rating' | 'createdAt']?: 'asc' | 'desc'; 
  } = {};
  if (sortBy === 'lowestrating') {
    sort = { rating: 'asc' };
  } else if (sortBy === 'highestrating') {
    sort = { rating: 'desc' };
  } else if (sortBy === 'oldest') {
    sort = { createdAt: 'asc' };
  } else {
    sort = { createdAt: 'desc' };
  }

  let filter: {
    customerId?: { not: Customer['id'] },
    rating?: number,
  } = {};
  let customerReview: null | DTO.RestaurantReviewsResponse = null;
  if (req.user) {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
    const findCustomerReview = await prisma.restaurantReview.findUnique({
      where: { customerId },
      include: {
        customer: {
          select: { username: true, name: true },
        }  
      },
    });
    if (findCustomerReview) {
      customerReview = {
        id: findCustomerReview.id,
        createdAt: findCustomerReview.createdAt,
        description: findCustomerReview.reviewDescription,
        rating: findCustomerReview.rating,
        reviewer: {
          username: findCustomerReview.customer.username,
          name: findCustomerReview.customer.name,
          everShoppingHere: findCustomerReview.hasCustomerBeenShoppingHere,
        },
      };
    } 
    filter = { ...filter, customerId: { not: customerId } };
  }
  if (rating) {
    if (!['1', '2', '3', '4', '5'].includes(rating)) {
      throw new BadRequest('rating query is not  number of 1-5');
    }
    filter = { ...filter, rating: Number(rating) };
  }

  const reviews = await prisma.restaurantReview.findMany({
    where: { restaurantId: restaurant.id, ...filter },
    include: {
      customer: {
        select: { username: true, name: true },
      },
    },
    orderBy: { ...sort },
    take: numberedLimit,
    skip: numberedLimit * (numberedPage - 1),
  });

  let countReviews = await prisma.restaurantReview.count({
    where: { restaurantId: restaurant.id, ...filter },
  });
  const totalPages = Math.ceil(countReviews / numberedLimit);

  const result: DTO.GetAllRestaurantReviewsResponse = {
    userReview: customerReview,
    reviews: reviews.map((review) => ({
      id: review.id,
      description: review.reviewDescription,
      rating: review.rating,
      reviewer: {
        username: review.customer.username,
        name: review.customer.name,
        everShoppingHere: review.hasCustomerBeenShoppingHere,
      },
      createdAt: review.createdAt,
    })),
    pages: totalPages,
    total: countReviews,
  };
  return result;
};

const createRestaurantReviews = async (
  req: Request,
): Promise<DTO.RestaurantReviewsResponse['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

  const { restaurantUsername } = req.params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { username: restaurantUsername },
  });
  if (!restaurant) {
    throw new NotFound('Restaurant is not Found.');
  }

  const body: DTO.RestaurantReviewBody = 
    DTO.restaurantReviewBodySchema.parse(req.body);

  const hasCustomerBeenShoppingHere = await prisma.order.findFirst({
      where: { customerId, restaurantId: restaurant.id, status: 'ACCEPTED_BY_CUSTOMER' },
    })
  ? true : false;
  const createdReview = await prisma.restaurantReview.create({
    data: {
      customerId,
      restaurantId: restaurant.id,
      reviewDescription: body.description,
      rating: Number(body.rating),
      hasCustomerBeenShoppingHere,
    }
  });
  await updateRestaurantRating(restaurant.id);

  return createdReview.id;
};

const updateRestaurantReviews = async (
  req: Request,
): Promise<DTO.RestaurantReviewsResponse['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

  const { restaurantUsername, reviewId } = req.params;
  if (!reviewId) {
    throw new BadRequest('reviewId param is missing.');
  }
  const restaurant = await prisma.restaurant.findUnique({
    where: { username: restaurantUsername },
  });
  if (!restaurant) {
    throw new NotFound('Restaurant is not Found.');
  }

  const body: DTO.RestaurantReviewBody = 
    DTO.restaurantReviewBodySchema.parse(req.body);

  const hasCustomerBeenShoppingHere = await prisma.order.findFirst({
      where: { customerId, restaurantId: restaurant.id, status: 'ACCEPTED_BY_CUSTOMER' },
    })
  ? true : false;
  const updatedReview = await prisma.restaurantReview.update({
    where: { id: reviewId, restaurantId: restaurant.id, customerId },
    data: {
      rating: Number(body.rating),
      reviewDescription: body.description,
      hasCustomerBeenShoppingHere,
    },
  });
  if (!updatedReview) {
    throw new NotFound('Review is not found.');
  }
  await updateRestaurantRating(restaurant.id);
  const { id: result } = updatedReview;
  return result;
};

const deleteRestaurantReviews = async (
  req: Request,
): Promise<DTO.RestaurantReviewsResponse['id'] | Error> => {
  const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;

  const { reviewId } = req.params;
  if (!reviewId) {
    throw new BadRequest('reviewId param is missing.');
  }
  const deletedRestaurantReview = await prisma.restaurantReview.delete({
    where: {
      id: reviewId,
      customerId,
    },
  });

  if (!deletedRestaurantReview) {
    throw new NotFound('Review is not found.');
  }

  await updateRestaurantRating(deletedRestaurantReview.restaurantId);
  return deletedRestaurantReview.id;
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

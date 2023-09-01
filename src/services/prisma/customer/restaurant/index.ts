import { Request } from 'express';
import { capitalCase } from 'change-case';

import { BadRequest, NotFound } from '../../../../errors';
import prisma from '../../../../db';
import * as DTO from './types';
import checkRestaurantIsOpenNow from '../../../../utils/checkIsRestaurantOpenNow';
import { Customer } from '@prisma/client';

const findRestaurantByUsername = async (req: Request):
  Promise<DTO.FindRestaurantResponse | Error> => {
    try {
      const { restaurantUsername } = req.params;

      const foundRestaurant = await prisma.restaurant.findUnique({
        where: { username: restaurantUsername },
      });

      if (!foundRestaurant) {
        throw new NotFound('Restaurant Username not Found. Please input valid restaurant username.');
      }

      const result: DTO.FindRestaurantResponse = {
        id: foundRestaurant.id,
        avatar: foundRestaurant.avatar,
        username: foundRestaurant.username,
        name: foundRestaurant.name,
      };

      return result;
    } catch (error: any) {
      throw error;
    }
  };

const getRestaurantProfile = async (req: Request):
  Promise<DTO.RestaurantProfileResponse | Error> => {
    try {
      const { restaurantUsername } = req.params;

      const restaurant = await prisma.restaurant.findUnique({
        where: { username: restaurantUsername },
        include: { address: true },
      });

      if (!restaurant) {
        throw new NotFound('Restaurant Username not Found. Please input valid restaurant username.');
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

      const result: DTO.RestaurantProfileResponse = {
        id: restaurant.id,
        username: restaurant.username,
        name: restaurant.name,
        avatar: restaurant.avatar,
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
    } catch (error) {
      throw error;
    }
  };

const getAllRestaurantMenus = async (req: Request):
  Promise<DTO.GetAllRestaurantMenusResponse | Error> => {
    try {
      const { restaurantUsername } = req.params;
      const restaurant = await prisma.restaurant.findUnique({
        where: { username: restaurantUsername },
      });
      if (!restaurant) {
        throw new NotFound('Restaurant Username not Found. Please input valid restaurant username.');
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
        throw new BadRequest('Invalid Request. \'limit\' and \'page\' query is not valid. Please check your input data.');
      }

      if (!['newest', 'oldest', 'lowestprice', 'highestprice'].includes(sortBy)) {
        throw new BadRequest('Invalid Request. \'sortBy\' query is not valid. Please check your input data.');
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
        throw new NotFound('EtalaseId not Found. Please input valid etalaseId.');
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
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('EtalaseId not Found. Please input valid etalaseId.');
      }
      throw error;
    }
  };

const getAllRestaurantReviews = async (req: Request): 
  Promise<DTO.GetAllRestaurantReviewsResponse | Error> => {
    try {
      const { restaurantUsername } = req.params;
      const restaurant = await prisma.restaurant.findUnique({
        where: { username: restaurantUsername },
      });
      if (!restaurant) {
        throw new NotFound('Restaurant Username not Found. Please input valid restaurant username.');
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
        throw new BadRequest('Invalid Request. \'limit\' and \'page\' query is not valid. Please check your input data.');
      }

      if (!['newest', 'oldest', 'lowestrating', 'highestrating'].includes(sortBy)) {
        throw new BadRequest('Invalid Request. \'sortBy\' query is not valid. Please check your input data.');
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
          throw new BadRequest('Invalid Request. \'rating\' query is not valid. Please check your input data.');
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
    } catch (error: any) {
      throw error;
    }
  };

const createRestaurantReviews = async (req: Request):
  Promise<DTO.RestaurantReviewsResponse['id'] | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
    try {
      const { restaurantUsername } = req.params;
      const restaurant = await prisma.restaurant.findUnique({
        where: { username: restaurantUsername },
      });
      if (!restaurant) {
        throw new NotFound('Restaurant Username not Found. Please input valid restaurant username.');
      }

      const body: DTO.RestaurantReviewBody = 
        DTO.restaurantReviewBodySchema.parse(req.body);

      // create review
      // TODO has customer has been shopping here harus punya order dulu euy, eta can bikin collectionna soalna jadi teu bisa cek
      const createdReview = await prisma.restaurantReview.create({
        data: {
          customerId,
          restaurantId: restaurant.id,
          reviewDescription: body.description,
          rating: Number(body.rating),
        }
      });
      return createdReview.id;
    } catch (error: any) {
      throw error;
    }
  };

const updateRestaurantReviews = async (req: Request):
  Promise<DTO.RestaurantReviewsResponse['id'] | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
    try {
      const { restaurantUsername, reviewId } = req.params;
      if (!reviewId) {
        throw new BadRequest('Invalid Request. reviewId is missing. Please check your input data.');
      }
      const restaurant = await prisma.restaurant.findUnique({
        where: { username: restaurantUsername },
      });
      if (!restaurant) {
        throw new NotFound('Restaurant Username not Found. Please input valid restaurant username.');
      }

      const body: DTO.RestaurantReviewBody = 
        DTO.restaurantReviewBodySchema.parse(req.body);

      const updatedReview = await prisma.restaurantReview.update({
        where: { id: reviewId, restaurantId: restaurant.id, customerId },
        data: {
          rating: Number(body.rating),
          reviewDescription: body.description,
        },
      });
      if (!updatedReview) {
        throw new NotFound('Review id not found. Please input valid review id.');
      }
      const { id: result } = updatedReview;
      return result;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Review id not found. Please input valid review id.');
      }
      throw error;
    }
  };

const deleteRestaurantReviews = async (req: Request):
  Promise<DTO.RestaurantReviewsResponse['id'] | Error> => {
    const { id: customerId } = req.user as Pick<Customer, 'id' | 'email'>;
    try {
      const { reviewId } = req.params;
      if (!reviewId) {
        throw new BadRequest('Invalid Request. reviewId is missing. Please check your input data.');
      }
      const deletedRestaurantReview = await prisma.restaurantReview.delete({
        where: {
          id: reviewId,
          customerId,
        },
      });

      if (!deletedRestaurantReview) {
        throw new NotFound('Review id not found. Please input valid review id.');
      }

      return deletedRestaurantReview.id;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Review id not found. Please input valid review id.');
      }
      throw error;
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

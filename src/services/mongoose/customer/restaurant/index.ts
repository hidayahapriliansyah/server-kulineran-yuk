import { Request } from 'express';
import { capitalCase } from 'change-case';

import * as DTO from './types';
import Restaurant, { IRestaurant } from '../../../../models/Restaurant';
import { BadRequest, NotFound } from '../../../../errors';
import RestaurantAddress from '../../../../models/RestaurantAddress';
import checkRestaurantIsOpenNow from '../../../../utils/checkIsRestaurantOpenNow';
import Menu from '../../../../models/Menu';
import RestaurantReview, { IRestaurantReview } from '../../../../models/RestaurantReview';
import { ICustomer } from '../../../../models/Customer';
import Etalase from '../../../../models/Etalase';

const findRestaurantByUsername = async (req: Request):
  Promise<DTO.FindRestaurantResponse | Error> => {
    try {
      const { restaurantUsername } = req.params;

      const foundRestaurant = await Restaurant.findOne({ username: restaurantUsername });

      if (!foundRestaurant) {
        throw new NotFound('Restaurant Username not Found. Please input valid restaurant username.');
      }

      const result: DTO.FindRestaurantResponse = {
        _id: foundRestaurant._id,
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

      const restaurant = await Restaurant.findOne({ username: restaurantUsername });

      if (!restaurant) {
        throw new NotFound('Restaurant Username not Found. Please input valid restaurant username.');
      }

      const restaurantAddress = await RestaurantAddress.findOne({
        restaurantId: restaurant._id,
      });

      const restaurantDetailAddress = restaurantAddress
        ? `${restaurantAddress.detail}, ${capitalCase(restaurantAddress.villageName)}, ${capitalCase(restaurantAddress.districtName)}, ${capitalCase(restaurantAddress.regencyName)}, ${capitalCase(restaurantAddress.provinceName)}`
        : null;

      const isOpen = restaurant.openingHour && restaurant.closingHour
        ? checkRestaurantIsOpenNow({
            openingHour: restaurant.openingHour,
            closingHour: restaurant.closingHour,
            daysoff: restaurant.daysOff,
          })
        : null;

      const result: DTO.RestaurantProfileResponse = {
        _id: restaurant._id,
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
        isOpenNow: isOpen as boolean,
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
      const restaurant = await Restaurant.findOne({ username: restaurantUsername });
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
        const findEtalase = await Etalase.findById(etalaseId);
        if (!findEtalase) {
        throw new NotFound('EtalaseId not Found. Please input valid etalaseId.');
        }
        filter = { ...filter, etalaseId };
      }

      const menus = await Menu.find({ restaurantId: restaurant._id, ...filter })
        .sort({ ...sort })
        .limit(numberedLimit)
        .skip(numberedLimit * (numberedPage - 1));

      const countMenus = await Menu.countDocuments({ restaurantId: restaurant._id, ...filter });
      const totalPages = Math.ceil(countMenus / numberedLimit);

      if (numberedPage !== 1 && numberedPage > totalPages) {
        throw new BadRequest('Input page is bigger than total pages. Please check your page query.');
      }

      const result: DTO.GetAllRestaurantMenusResponse = {
        menus: menus.map((menu) => ({
          _id: menu._id,
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
      const restaurant = await Restaurant.findOne({ username: restaurantUsername });
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

      let sort = {};
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
        customerId?: { $ne: ICustomer['_id'] },
        rating?: number,
      } = {};
      let customerReview: null | DTO.RestaurantReviewsResponse = null;
      if (req.user) {
        const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
        const findCustomerReview = await RestaurantReview.findOne({ customerId })
          .populate({
            path: 'customerId',
            select: 'username name',
          });
        if (findCustomerReview) {
          customerReview = {
            _id: findCustomerReview._id,
            createdAt: findCustomerReview.createdAt,
            description: findCustomerReview.reviewDescription,
            rating: findCustomerReview.rating,
            reviewer: {
              username: (findCustomerReview.customerId as ICustomer).username,
              name: (findCustomerReview.customerId as ICustomer).name,
              everShoppingHere: findCustomerReview.hasCustomerBeenShoppingHere,
            },
          };
        } 
        filter = { ...filter, customerId: { $ne: customerId } };
      }
      if (rating) {
        if (!['1', '2', '3', '4', '5'].includes(rating)) {
          throw new BadRequest('Invalid Request. \'rating\' query is not valid. Please check your input data.');
        }
        filter = { ...filter, rating: Number(rating) };
      }

      const reviews = await RestaurantReview.find({ restaurantId: restaurant._id, ...filter })
        .populate({
          path: 'customerId',
          select: 'username name',
        })
        .sort({ ...sort })
        .limit(numberedLimit)
        .skip(numberedLimit * (numberedPage - 1));

      let countReviews = await RestaurantReview.countDocuments({ restaurantId: restaurant._id, ...filter });
      const totalPages = Math.ceil(countReviews / numberedLimit);

      const result: DTO.GetAllRestaurantReviewsResponse = {
        userReview: customerReview,
        reviews: reviews.map((review) => ({
          _id: review._id,
          description: review.reviewDescription,
          rating: review.rating,
          reviewer: {
            username: (review.customerId as ICustomer).username,
            name: (review.customerId as ICustomer).name,
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
  Promise<DTO.RestaurantReviewsResponse['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    try {
      const { restaurantUsername } = req.params;
      const restaurant = await Restaurant.findOne({ username: restaurantUsername });
      if (!restaurant) {
        throw new NotFound('Restaurant Username not Found. Please input valid restaurant username.');
      }

      const body: DTO.RestaurantReviewBody = 
        DTO.restaurantReviewBodySchema.parse(req.body);

      // create review
      // TODO has customer has been shopping here harus punya order dulu euy, eta can bikin collectionna soalna jadi teu bisa cek
      const createdReview = await RestaurantReview.create({
        customerId,
        restaurantId: restaurant._id,
        reviewDescription: body.description,
        rating: Number(body.rating),
      });
      const { _id: result } = createdReview;
      return result;
    } catch (error: any) {
      throw error;
    }
  };

const updateRestaurantReviews = async (req: Request):
  Promise<DTO.RestaurantReviewsResponse['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    try {
      const { restaurantUsername, reviewId } = req.params;
      if (!reviewId) {
        throw new BadRequest('Invalid Request. reviewId is missing. Please check your input data.');
      }
      const restaurant = await Restaurant.findOne({ username: restaurantUsername });
      if (!restaurant) {
        throw new NotFound('Restaurant Username not Found. Please input valid restaurant username.');
      }

      const body: DTO.RestaurantReviewBody = 
        DTO.restaurantReviewBodySchema.parse(req.body);

      const updatedReview =await RestaurantReview.findOneAndUpdate(
        { _id: reviewId, restaurantId: restaurant._id, customerId},
        {
          rating: Number(body.rating),
          reviewDescription: body.description,
        },
      );
      if (!updatedReview) {
        throw new NotFound('Review id not found. Please input valid review id.');
      }
      const { _id: result } = updatedReview;
      return result;
    } catch (error: any) {
      if (error.name === 'CastError') {
        throw new NotFound('Review id not found. Please input valid review id.');
      }
      throw error;
    }
  };

const deleteRestaurantReviews = async (req: Request):
  Promise<DTO.RestaurantReviewsResponse['_id'] | Error> => {
    const { _id: customerId } = req.user as Pick<ICustomer, '_id' | 'email'>;
    try {
      const { restaurantUsername, reviewId } = req.params;
      if (!reviewId) {
        throw new BadRequest('Invalid Request. reviewId is missing. Please check your input data.');
      }
      const restaurant = await Restaurant.findOne({ username: restaurantUsername });
      if (!restaurant) {
        throw new NotFound('Restaurant Username not Found. Please input valid restaurant username.');
      }
      
      const deletedRestaurantReview =
        await RestaurantReview.findOneAndDelete({ _id: reviewId, restaurantId: restaurant._id, customerId });

      if (!deletedRestaurantReview) {
        throw new NotFound('Review id not found. Please input valid review id.');
      }

      const { _id: result} = deletedRestaurantReview;
      return result;
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

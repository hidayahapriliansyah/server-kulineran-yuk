import { Request } from 'express';
import mongoose, { mongo } from 'mongoose';

import config from '../../../../../../src/config';
import { BadRequest, NotFound } from '../../../../../../src/errors';
import RestaurantAddress from '../../../../../../src/models/RestaurantAddress';
import Restaurant, { IRestaurant } from '../../../../../../src/models/Restaurant';
import Customer, { ICustomer } from '../../../../../../src/models/Customer';
import Menu from '../../../../../../src/models/Menu';
import Etalase, { IEtalase } from '../../../../../../src/models/Etalase';

import mockAdminResto from '../../../../../mock/adminResto';
import mockRestaurantAddress from '../../../../../mock/restaurantAddress';
import * as mockCustomer from '../../../../../mock/customer';
import * as mockEtalase from '../../../../../mock/etalase';
import * as mockMenu from '../../../../../mock/menu';
import * as mockReview from '../../../../../mock/restaurantReview';
import * as restaurantService from '../../../../../../src/services/mongoose/customer/restaurant';
import * as DTO from '../../../../../../src/services/mongoose/customer/restaurant/types';
import { ZodError, any } from 'zod';
import RestaurantReview, { IRestaurantReview } from '../../../../../../src/models/RestaurantReview';

describe('test restaurant service', () => {
  beforeAll(async () => {
    await mongoose.connect(config.urlDb);
    // create restaurant dulu
    const { _id: restaurantId } = await Restaurant.create({
      ...mockAdminResto,
    });

    await RestaurantAddress.create({
      ...mockRestaurantAddress,
      restaurantId,
    });

    const { _id: etalasePedasId } = await Etalase.create({
      restaurantId,
      name: mockEtalase.etalasePedas.name,
    });

    const { _id: etalaseMinumanId } = await Etalase.create({
      restaurantId,
      name: mockEtalase.etalaseMinuman.name,
    });

    await Menu.create({
      ...mockMenu.seblakCeker,
      restaurantId,
      etalaseId: etalasePedasId,
    });

    await Menu.create({
      ...mockMenu.sotoKuahPedas,
      restaurantId,
      etalaseId: etalasePedasId,
    });

    await Menu.create({
      ...mockMenu.esJeruk,
      restaurantId,
      etalaseId: etalaseMinumanId,
    });

    await Customer.create({
      ...mockCustomer.customerSignup,
    });
  });
  afterAll(async () => {
    await RestaurantReview.deleteMany({});
    await Menu.deleteMany({});
    await Etalase.deleteMany({});
    await RestaurantAddress.deleteMany({});
    await Customer.deleteMany({});
    await Restaurant.deleteMany({});
    await mongoose.connection.close();
  });
  // test findRestaurantByUsername
  describe('test findRestaurantByUsername', () => {
    // error
    describe('error test', () => { 
      // should throw error NotFound if username has no match with any data 
      it('should throw error NotFound if username has no match with any data', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername: 'wrongusernamerestaurant',
          }
        } as unknown as Request;

        await expect(() => restaurantService.findRestaurantByUsername(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.findRestaurantByUsername(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Restaurant Username not Found. Please input valid restaurant username.');
        }
      });
    });
    // success
    describe('success test', () => { 
      // should return data with DTO.FindRestaurantResponse
      it('should return data with DTO.FindRestaurantResponse', async () => {
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername },
        } as unknown as Request;

        const foundRestaurant =
          await restaurantService.findRestaurantByUsername(req) as DTO.FindRestaurantResponse;

        expect(mongoose.Types.ObjectId.isValid(foundRestaurant._id.toString())).toBe(true);
        expect(foundRestaurant.avatar).toBe(mockAdminResto.avatar);
        expect(foundRestaurant.name).toBe(mockAdminResto.name);
        expect(foundRestaurant.username).toBe(mockAdminResto.username);
      });
    });
  });
  // test getRestaurantProfile
  describe('test getRestaurantProfile', () => { 
    // error
    describe('error test', () => { 
      // should throw error NotFound if username has no match with any data 
      it('should throw error NotFound if username has no match with any data', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername: 'wrongusernamerestaurant',
          }
        } as unknown as Request;

        await expect(() => restaurantService.getRestaurantProfile(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.getRestaurantProfile(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Restaurant Username not Found. Please input valid restaurant username.');
        }
      });
    });
    // success
    describe('success test', () => {
      // should return data DTO.RestaurantProfileResponse without null
      it('should throw error NotFound if username has no match with any data', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername },
        } as unknown as Request;
        
        const foundRestaurantProfile =
          await restaurantService.getRestaurantProfile(req) as DTO.RestaurantProfileResponse;

        expect(mongoose.Types.ObjectId.isValid(foundRestaurantProfile._id.toString())).toBe(true);
        expect(foundRestaurantProfile.detail.address).toBe('Kp. Bantarhuni RT 02 RW 02, Gunungtanjung, Gunungtanjung, Kabupaten Tasikmalaya, Jawa Barat');
        expect(foundRestaurantProfile.isOpenNow).not.toBeNull();
        
      });
      // should return data DTO.RestaurantProfileResponse with null (new resto signup)
      it('should return data DTO.RestaurantProfileResponse with null (new resto signup)', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.create({
          username: 'secondresto',
          name: 'Second Resto',
          email: 'secondresto@gmail.com',
          password: 'hellosecondresot',
        });

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername },
        } as unknown as Request;
        
        const foundRestaurantProfile =
          await restaurantService.getRestaurantProfile(req) as DTO.RestaurantProfileResponse;

        expect(mongoose.Types.ObjectId.isValid(foundRestaurantProfile._id.toString())).toBe(true);
        expect(foundRestaurantProfile.detail.address).toBeNull();
        expect(foundRestaurantProfile.detail.contact).toBeNull();
        expect(foundRestaurantProfile.detail.openingHour).toBeNull();
        expect(foundRestaurantProfile.detail.closingHour).toBeNull();
        expect(foundRestaurantProfile.detail.daysOff).toStrictEqual([]);
        expect(foundRestaurantProfile.locationLink).toBeNull();
        expect(foundRestaurantProfile.isOpenNow).toBeNull();
        expect(foundRestaurantProfile.gallery).toStrictEqual(['', '', '', '', '']);
      });
    });
  });
  // test getAllRestaurantMenus
  describe('test getAllRestaurantMenus', () => { 
    // error
    describe('error test', () => {
      // should throw error NotFound if restaurant username is not match with any data
      it('should throw error NotFound if restaurant username is not match with any data', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername: 'wrongusernamerestaurant',
          }
        } as unknown as Request;

        await expect(() => restaurantService.getAllRestaurantMenus(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.getAllRestaurantMenus(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Restaurant Username not Found. Please input valid restaurant username.');
        }
      });
      // should throw error BadRequest if limit or page query is not number
      it('should throw error BadRequest if limit or page query is not number', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername },
          query: {
            limit: 'sdf',
            page: 'sdfsd',
          }
        } as unknown as Request;

        await expect(() => restaurantService.getAllRestaurantMenus(req))
          .rejects.toThrow(BadRequest);

        try {
          await restaurantService.getAllRestaurantMenus(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BadRequest);
          expect(error.message).toBe('Invalid Request. \'limit\' and \'page\' query is not valid. Please check your input data.');
        }
      });
      // should throw error BadRequest if sortBy query is not valid value
      it('should throw error BadRequest if sortBy query is not valid value', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername },
          query: {
            sortBy: 'randomsoryby',
          }
        } as unknown as Request;

        await expect(() => restaurantService.getAllRestaurantMenus(req))
          .rejects.toThrow(BadRequest);

        try {
          await restaurantService.getAllRestaurantMenus(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BadRequest);
          expect(error.message).toBe('Invalid Request. \'sortBy\' query is not valid. Please check your input data.');
        }
      });
      // should throw error BadRequest if page query is bigger than totalPage
      it('should throw error BadRequest if page query is bigger than totalPage', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername },
          query: {
            page: '2',
          }
        } as unknown as Request;

        await expect(() => restaurantService.getAllRestaurantMenus(req))
          .rejects.toThrow(BadRequest);

        try {
          await restaurantService.getAllRestaurantMenus(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BadRequest);
          expect(error.message).toBe('Input page is bigger than total pages. Please check your page query.');
        }
      });
      // should throw error NotFound if etalaseId param is not found (objectId)
      it('should throw error NotFound if etalaseId param is not found (objectId)', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { 
            restaurantUsername,
          },
          query: {
            etalaseId: '5f78c8b0e99d8833d8c9eb6a',
          }
        } as unknown as Request;

        await expect(() => restaurantService.getAllRestaurantMenus(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.getAllRestaurantMenus(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('EtalaseId not Found. Please input valid etalaseId.');
        }
      });
      // should throw error NotFound if etalaseId param is not found (random string)
      it('should throw error NotFound if etalaseId param is not found (random string)', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { 
            restaurantUsername,
          },
          query: {
            etalaseId: 'random',
          }
        } as unknown as Request;

        await expect(() => restaurantService.getAllRestaurantMenus(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.getAllRestaurantMenus(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('EtalaseId not Found. Please input valid etalaseId.');
        }
      });
    });
    // success
    describe('success test', () => {
      // should return valid data DTO.GetAllRestaurantMenusResponse with default query
      it('should return valid data DTO.GetAllRestaurantMenusResponse with default query', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { 
            restaurantUsername,
          },
          query: {},
        } as unknown as Request;

        const menus =
          await restaurantService.getAllRestaurantMenus(req) as DTO.GetAllRestaurantMenusResponse;

        expect(menus.menus).toHaveLength(3);
        expect(menus.pages).toBe(1);
        expect(menus.total).toBe(3);
        expect(menus.menus[0]).toHaveProperty('_id');
        expect(menus.menus[0]).toHaveProperty('name');
        expect(menus.menus[0]).toHaveProperty('slug');
        expect(menus.menus[0]).toHaveProperty('image');
        expect(menus.menus[0]).toHaveProperty('price');
        expect(menus.menus[0].name).toBe(mockMenu.esJeruk.name);
        expect(menus.menus[2].name).toBe(mockMenu.seblakCeker.name);
      });
      // should return valid data DTO.GetAllRestaurantMenusResponse with sortBy lowestprice query
      it('should return valid data DTO.GetAllRestaurantMenusResponse with sortBy lowest query', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { 
            restaurantUsername,
          },
          query: {
            limit: '10',
            page: '1',
            sortBy: 'lowestprice',
          },
        } as unknown as Request;

        const menus =
          await restaurantService.getAllRestaurantMenus(req) as DTO.GetAllRestaurantMenusResponse;

        expect(menus.menus).toHaveLength(3);
        expect(menus.pages).toBe(1);
        expect(menus.total).toBe(3);
        expect(menus.menus[0]).toHaveProperty('_id');
        expect(menus.menus[0]).toHaveProperty('name');
        expect(menus.menus[0]).toHaveProperty('slug');
        expect(menus.menus[0]).toHaveProperty('image');
        expect(menus.menus[0]).toHaveProperty('price');
        expect(menus.menus[0].name).toBe(mockMenu.esJeruk.name);
        expect(menus.menus[2].name).toBe(mockMenu.sotoKuahPedas.name);
      });
      // should return valid data DTO.GetAllRestaurantMenusResponse with sortBy highestprice query
      it('should return valid data DTO.GetAllRestaurantMenusResponse with sortBy highestprice query', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { 
            restaurantUsername,
          },
          query: {
            limit: '10',
            page: '1',
            sortBy: 'highestprice',
          },
        } as unknown as Request;

        const menus =
          await restaurantService.getAllRestaurantMenus(req) as DTO.GetAllRestaurantMenusResponse;

        expect(menus.menus).toHaveLength(3);
        expect(menus.pages).toBe(1);
        expect(menus.total).toBe(3);
        expect(menus.menus[0]).toHaveProperty('_id');
        expect(menus.menus[0]).toHaveProperty('name');
        expect(menus.menus[0]).toHaveProperty('slug');
        expect(menus.menus[0]).toHaveProperty('image');
        expect(menus.menus[0]).toHaveProperty('price');
        expect(menus.menus[0].name).toBe(mockMenu.sotoKuahPedas.name);
        expect(menus.menus[2].name).toBe(mockMenu.esJeruk.name);
      });
      // should return valid data DTO.GetAllRestaurantMenusResponse with sortBy oldest query
      it('should return valid data DTO.GetAllRestaurantMenusResponse with sortBy oldest query', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;
        const { _id: etalaseId } = await Etalase.findOne({ name: 'Pedas'}) as IEtalase;

        const req = {
          user: { _id: customerId },
          params: { 
            restaurantUsername,
          },
          query: {
            limit: '10',
            page: '1',
            sortBy: 'oldest',
          },
        } as unknown as Request;

        const menus =
          await restaurantService.getAllRestaurantMenus(req) as DTO.GetAllRestaurantMenusResponse;

        expect(menus.menus).toHaveLength(3);
        expect(menus.pages).toBe(1);
        expect(menus.total).toBe(3);
        expect(menus.menus[0]).toHaveProperty('_id');
        expect(menus.menus[0]).toHaveProperty('name');
        expect(menus.menus[0]).toHaveProperty('slug');
        expect(menus.menus[0]).toHaveProperty('image');
        expect(menus.menus[0]).toHaveProperty('price');
        expect(menus.menus[0].name).toBe(mockMenu.seblakCeker.name);
      });
      // should return valid data DTO.GetAllRestaurantMenusResponse with sortBy newest query
      it('should return valid data DTO.GetAllRestaurantMenusResponse with sortBy newest query', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;
        const { _id: etalaseId } = await Etalase.findOne({ name: 'Pedas'}) as IEtalase;

        const req = {
          user: { _id: customerId },
          params: { 
            restaurantUsername,
          },
          query: {
            limit: '10',
            page: '1',
            sortBy: 'newest',
          },
        } as unknown as Request;

        const menus =
          await restaurantService.getAllRestaurantMenus(req) as DTO.GetAllRestaurantMenusResponse;

        expect(menus.menus).toHaveLength(3);
        expect(menus.pages).toBe(1);
        expect(menus.total).toBe(3);
        expect(menus.menus[0]).toHaveProperty('_id');
        expect(menus.menus[0]).toHaveProperty('name');
        expect(menus.menus[0]).toHaveProperty('slug');
        expect(menus.menus[0]).toHaveProperty('image');
        expect(menus.menus[0]).toHaveProperty('price');
        expect(menus.menus[0].name).toBe(mockMenu.esJeruk.name);
      });
      // should return valid data DTO.GetAllRestaurantMenusResponse with limit page, etalaseId query
      it('should return valid data DTO.GetAllRestaurantMenusResponse with default query', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;
        const { _id: etalaseId } = await Etalase.findOne({ name: 'Pedas'}) as IEtalase;

        const req = {
          user: { _id: customerId },
          params: { 
            restaurantUsername,
          },
          query: {
            limit: '1',
            page: '2',
            etalaseId,
          },
        } as unknown as Request;

        const menus =
          await restaurantService.getAllRestaurantMenus(req) as DTO.GetAllRestaurantMenusResponse;

        expect(menus.menus).toHaveLength(1);
        expect(menus.menus[0]).toHaveProperty('_id');
        expect(menus.menus[0]).toHaveProperty('name');
        expect(menus.menus[0]).toHaveProperty('slug');
        expect(menus.menus[0]).toHaveProperty('image');
        expect(menus.menus[0]).toHaveProperty('price');
        expect(menus.pages).toBe(2);
        expect(menus.total).toBe(2);
      });
    });
  });
  // test getAllRestaurantReviews
  describe('test getAllRestaurantReviews', () => {
    beforeAll(async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
      const customer1 = await Customer.findOne() as ICustomer;
      const customer2 = await Customer.create({
        ...mockCustomer.customerSignup2,
      }); 
      const customer3 = await Customer.create({
        ...mockCustomer.customerSignup3,
      }); 
      const customer4 = await Customer.create({
        ...mockCustomer.customerSignup4,
      }); 
      const customer5 = await Customer.create({
        ...mockCustomer.customerSignup5,
      }); 

      await RestaurantReview.create({
        ...mockReview.review1,
        restaurantId,
        customerId: customer1._id,
      });
      await RestaurantReview.create({
        ...mockReview.review2,
        restaurantId,
        customerId: customer2._id,
      });
      await RestaurantReview.create({
        ...mockReview.review3,
        restaurantId,
        customerId: customer3._id,
      });
      await RestaurantReview.create({
        ...mockReview.review4,
        restaurantId,
        customerId: customer4._id,
      });
      await RestaurantReview.create({
        ...mockReview.review5,
        restaurantId,
        customerId: customer5._id,
      });
    });
    afterAll(async () => {
      await RestaurantReview.deleteMany({});
    });
    // error
    describe('error test', () => {
      // should throw error NotFound if restaurant username is not match
      it('should throw error NotFound if restaurant username is not match', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername: 'wrongrestaurantusername',
          },
        } as unknown as Request;

        await expect(() => restaurantService.getAllRestaurantReviews(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.getAllRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Restaurant Username not Found. Please input valid restaurant username.');
        }
      });
      // should throw error BadRequest if limit or page query is not number
      it('should throw error BadRequest if limit or page query is not number', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;
        const restaurant = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername: restaurant.username,
          },
          query: {
            limit: 'sjdfsdf',
          }
        } as unknown as Request;

        await expect(() => restaurantService.getAllRestaurantReviews(req))
          .rejects.toThrow(BadRequest);

        try {
          await restaurantService.getAllRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BadRequest);
          expect(error.message).toBe('Invalid Request. \'limit\' and \'page\' query is not valid. Please check your input data.');
        }
      });
      // should throw error BadRequest if sortBy query is not valid
      it('should throw error BadRequest if sortBy query is not valid', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;
        const restaurant = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername: restaurant.username,
          },
          query: {
            sortBy: 'somerandomsortbythatcauseserror',
          }
        } as unknown as Request;

        await expect(() => restaurantService.getAllRestaurantReviews(req))
          .rejects.toThrow(BadRequest);

        try {
          await restaurantService.getAllRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BadRequest);
          expect(error.message).toBe('Invalid Request. \'sortBy\' query is not valid. Please check your input data.');
        }
      });
      // should throw error BadRequest if rating query is not valid
      it('should throw error BadRequest if rating query is not valid', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;
        const restaurant = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername: restaurant.username,
          },
          query: {
            rating: '6',
          }
        } as unknown as Request;

        await expect(() => restaurantService.getAllRestaurantReviews(req))
          .rejects.toThrow(BadRequest);

        try {
          await restaurantService.getAllRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BadRequest);
          expect(error.message).toBe('Invalid Request. \'rating\' query is not valid. Please check your input data.');
        }
      });
    });
    // success
    describe('success test', () => {
      beforeAll(async () => {
        await Customer.create({
          username: 'idontgiveriview',
          name: 'No Body',
          email: 'nobody@gmail.com',
          password: 'hellonobody@gmail.com',
        });
      });
      afterAll(async () => {
        await Customer.findOneAndDelete({ username: 'idontgiveriview' });
      });
      // should return valid response with default query and customer has no given review
      it('should return valid response with default query and customer has no given review', async () => {
        const customer =
          await Customer.findOne({ username: 'idontgiveriview' }) as Pick<ICustomer, '_id' | 'email'>;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customer._id },
          params: {
            restaurantUsername,
          },
          query: {},
        } as unknown as Request;

        const reviews =
          await restaurantService.getAllRestaurantReviews(req) as DTO.GetAllRestaurantReviewsResponse;

        expect(reviews.userReview).toBeNull();
        expect(reviews.reviews).toHaveLength(5);
        expect(reviews.pages).toBe(1);
        expect(reviews.total).toBe(5);
        expect(reviews.reviews[0].reviewer.username).toBe('dattebayo');
        expect(reviews.reviews[4].reviewer.username).toBe('hidayahapriliansyah');
        expect(reviews.reviews[0]).toHaveProperty('_id');
        expect(reviews.reviews[0]).toHaveProperty('description');
        expect(reviews.reviews[0]).toHaveProperty('rating');
        expect(reviews.reviews[0]).toHaveProperty('createdAt');
      });
      // should return valid response with default query and customer has given review
      it('should return valid response with default query and customer has given review', async () => {
        const customer =
          await Customer.findOne({ username: 'firmansyah' }) as Pick<ICustomer, '_id' | 'email'>;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customer._id },
          params: {
            restaurantUsername,
          },
          query: {},
        } as unknown as Request;

        const reviews =
          await restaurantService.getAllRestaurantReviews(req) as DTO.GetAllRestaurantReviewsResponse;

        expect((reviews.userReview as DTO.RestaurantReviewsResponse).reviewer.username)
          .toBe('firmansyah');
        expect(reviews.userReview).toHaveProperty('_id');
        expect(reviews.userReview).toHaveProperty('description');
        expect(reviews.userReview).toHaveProperty('rating');
        expect(reviews.userReview).toHaveProperty('createdAt');
        expect(reviews.reviews).toHaveLength(4);
        expect(reviews.pages).toBe(1);
        expect(reviews.total).toBe(4);
        expect(reviews.reviews[0].reviewer.username).toBe('dattebayo');
        expect(reviews.reviews[3].reviewer.username).toBe('hidayahapriliansyah');
        expect(reviews.reviews[0]).toHaveProperty('_id');
        expect(reviews.reviews[0]).toHaveProperty('description');
        expect(reviews.reviews[0]).toHaveProperty('rating');
        expect(reviews.reviews[0]).toHaveProperty('createdAt');
      });
      // should return valid response with limit, page, and sortBy query and customer has no given review
      it('should return valid response with limit, page, and sortBy query and customer has no given review', async () => {
        const customer =
          await Customer.findOne({ username: 'idontgiveriview' }) as Pick<ICustomer, '_id' | 'email'>;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customer._id },
          params: {
            restaurantUsername,
          },
          query: {
            limit: '3',
            page: '2',
            sortBy: 'oldest',
          },
        } as unknown as Request;

        const reviews =
          await restaurantService.getAllRestaurantReviews(req) as DTO.GetAllRestaurantReviewsResponse;

        expect(reviews.userReview).toBeNull();
        expect(reviews.reviews).toHaveLength(2);
        expect(reviews.pages).toBe(2);
        expect(reviews.total).toBe(5);
        expect(reviews.reviews[0].reviewer.username).toBe('ikuralilas');
        expect(reviews.reviews[1].reviewer.username).toBe('dattebayo');
        expect(reviews.reviews[0]).toHaveProperty('_id');
        expect(reviews.reviews[0]).toHaveProperty('description');
        expect(reviews.reviews[0]).toHaveProperty('rating');
        expect(reviews.reviews[0]).toHaveProperty('createdAt');
      });
      // should return valid response with sortBy and rating query and customer has no given review
      it('should return valid response with sortBy and rating query and customer has no given review', async () => {
        const customer =
          await Customer.findOne({ username: 'idontgiveriview' }) as Pick<ICustomer, '_id' | 'email'>;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customer._id },
          params: {
            restaurantUsername,
          },
          query: {
            rating: '5',
            sortBy: 'oldest',
          },
        } as unknown as Request;

        const reviews =
          await restaurantService.getAllRestaurantReviews(req) as DTO.GetAllRestaurantReviewsResponse;

        expect(reviews.userReview).toBeNull();
        expect(reviews.reviews).toHaveLength(2);
        expect(reviews.pages).toBe(1);
        expect(reviews.total).toBe(2);
        expect(reviews.reviews[0].reviewer.username).toBe('hidayahapriliansyah');
        expect(reviews.reviews[1].reviewer.username).toBe('ikuralilas');
        expect(reviews.reviews[0]).toHaveProperty('_id');
        expect(reviews.reviews[0]).toHaveProperty('description');
        expect(reviews.reviews[0]).toHaveProperty('rating');
        expect(reviews.reviews[0]).toHaveProperty('createdAt');
      });
      // should return valid response with sortBy highestrating has no given review
      it('should return valid response with sortBy highestrating has no given review', async () => {
        const customer =
          await Customer.findOne({ username: 'idontgiveriview' }) as Pick<ICustomer, '_id' | 'email'>;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customer._id },
          params: {
            restaurantUsername,
          },
          query: {
            sortBy: 'highestrating',
          },
        } as unknown as Request;

        const reviews =
          await restaurantService.getAllRestaurantReviews(req) as DTO.GetAllRestaurantReviewsResponse;

        expect(reviews.userReview).toBeNull();
        expect(reviews.reviews).toHaveLength(5);
        expect(reviews.pages).toBe(1);
        expect(reviews.total).toBe(5);
        expect(reviews.reviews[0].reviewer.username).toBe('hidayahapriliansyah');
        expect(reviews.reviews[0].rating).toBe(5);
        expect(reviews.reviews[1].reviewer.username).toBe('ikuralilas');
        expect(reviews.reviews[1].rating).toBe(5);
        expect(reviews.reviews[4].reviewer.username).toBe('bapakmulyadi');
        expect(reviews.reviews[4].rating).toBe(1);
        expect(reviews.reviews[0]).toHaveProperty('_id');
        expect(reviews.reviews[0]).toHaveProperty('description');
        expect(reviews.reviews[0]).toHaveProperty('rating');
        expect(reviews.reviews[0]).toHaveProperty('createdAt');
      });
      // should return valid response with sortBy lowestrating has no given review
      it('should return valid response with sortBy lowestrating has no given review', async () => {
        const customer =
          await Customer.findOne({ username: 'idontgiveriview' }) as Pick<ICustomer, '_id' | 'email'>;
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customer._id },
          params: {
            restaurantUsername,
          },
          query: {
            sortBy: 'lowestrating',
          },
        } as unknown as Request;

        const reviews =
          await restaurantService.getAllRestaurantReviews(req) as DTO.GetAllRestaurantReviewsResponse;

        expect(reviews.userReview).toBeNull();
        expect(reviews.reviews).toHaveLength(5);
        expect(reviews.pages).toBe(1);
        expect(reviews.total).toBe(5);
        expect(reviews.reviews[0].reviewer.username).toBe('bapakmulyadi');
        expect(reviews.reviews[0].rating).toBe(1);
        expect(reviews.reviews[3].reviewer.username).toBe('hidayahapriliansyah');
        expect(reviews.reviews[3].rating).toBe(5);
        expect(reviews.reviews[4].reviewer.username).toBe('ikuralilas');
        expect(reviews.reviews[4].rating).toBe(5);
        expect(reviews.reviews[0]).toHaveProperty('_id');
        expect(reviews.reviews[0]).toHaveProperty('description');
        expect(reviews.reviews[0]).toHaveProperty('rating');
        expect(reviews.reviews[0]).toHaveProperty('createdAt');
      });
    });
  });
  // test createRestaurantReviews
  describe('test createRestaurantReviews', () => { 
    // error
    describe('error test', () => { 
      // should throw error NotFound if restaurant username param is not match
      it('should throw error NotFound if restaurant username param is not match', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername: 'wrongrestaurantusername',
          },
          body: {},
        } as unknown as Request;

        await expect(() => restaurantService.createRestaurantReviews(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.createRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Restaurant Username not Found. Please input valid restaurant username.');
        }
      });
      // should throw error ZodError if \'rating\' is missing
      it('should throw error NotFound if restaurant username param is not match', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const restaurant = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername: restaurant.username },
          body: {},
        } as unknown as Request;

        req.body = {
          description: mockReview.review1.reviewDescription,
        };
        await expect(() => restaurantService.createRestaurantReviews(req))
          .rejects.toThrow(ZodError);

        try {
          await restaurantService.createRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('rating');
          expect(error.errors[0].message).toBe('Rating harus diisi.');
        }
      });
      // should throw error ZodError if \'rating\' is not number
      it('should throw error ZodError if \'rating\' is not number', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const restaurant = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername: restaurant.username },
          body: {},
        } as unknown as Request;

        req.body = {
          description: mockReview.review1.reviewDescription,
          rating: 'hello',
        };
        await expect(() => restaurantService.createRestaurantReviews(req))
          .rejects.toThrow(ZodError);

        try {
          await restaurantService.createRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('rating');
          expect(error.errors[0].message).toBe('Rating harus diisi nilai 1, 2, 3, 4, atau 5.');
        }
      });
      // should throw error ZodError if \'rating\' is not number of 1 2 3 4 5
      it('should throw error ZodError if \'rating\' is not number of 1 2 3 4 5', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const restaurant = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername: restaurant.username },
          body: {},
        } as unknown as Request;

        req.body = {
          description: mockReview.review1.reviewDescription,
          rating: 6,
        };
        await expect(() => restaurantService.createRestaurantReviews(req))
          .rejects.toThrow(ZodError);

        try {
          await restaurantService.createRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('rating');
          expect(error.errors[0].message).toBe('Rating harus diisi nilai 1, 2, 3, 4, atau 5.');
        }
      });
      // should throw error ZodError if \'description\' is missing
      it('should throw error ZodError if \'description\' is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const restaurant = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername: restaurant.username },
          body: {},
        } as unknown as Request;

        req.body = {
          rating: mockReview.review1.rating,
        };
        await expect(() => restaurantService.createRestaurantReviews(req))
          .rejects.toThrow(ZodError);

        try {
          await restaurantService.createRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('description');
          expect(error.errors[0].message).toBe('Deskripsi harus diisi.');
        }
      });
      // should throw error ZodError if \'description\' is not string
      it('should throw error ZodError if \'description\' is nto string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const restaurant = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername: restaurant.username },
          body: {},
        } as unknown as Request;

        req.body = {
          description: 10,
          rating: mockReview.review1.rating,
        };
        await expect(() => restaurantService.createRestaurantReviews(req))
          .rejects.toThrow(ZodError);

        try {
          await restaurantService.createRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('description');
          expect(error.errors[0].message).toBe('Deskripsi harus diisi berupa string.');
        }
      });
      // should throw error ZodError if \'description\' has more than 250 chars
      it('should throw error ZodError if \'description\' has more than 250 chars', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const restaurant = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername: restaurant.username },
          body: {},
        } as unknown as Request;

        let overloadDescription = '';
        for(let i = 1; i <= 250; i++) {
          overloadDescription = (overloadDescription + mockReview.review1.reviewDescription);
        }
        req.body = {
          description: overloadDescription,
          rating: mockReview.review1.rating,
        };
        await expect(() => restaurantService.createRestaurantReviews(req))
          .rejects.toThrow(ZodError);

        try {
          await restaurantService.createRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('description');
          expect(error.errors[0].message).toBe('Deskripsi maksimal memiliki 250 karakter.');
        }
      });
    });
    // success
    describe('success test', () => { 
      // should return _id of created review
      it('should return _id of created review', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const restaurant = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          params: { restaurantUsername: restaurant.username },
          body: {},
        } as unknown as Request;

        req.body = {
          description: mockReview.review1.reviewDescription,
          rating: mockReview.review1.rating,
        };

        const createdReviewId = await restaurantService.createRestaurantReviews(req);
        const createdReview = await RestaurantReview.findById(createdReviewId);

        expect(mongoose.Types.ObjectId.isValid(createdReviewId.toString())).toBe(true);
        expect(createdReview!.restaurantId.toString()).toBe(restaurant._id.toString());
        expect(createdReview!.customerId.toString()).toBe(customerId.toString());
        expect(createdReview!.reviewDescription).toBe(mockReview.review1.reviewDescription);
        expect(createdReview!.rating).toBe(Number(mockReview.review1.rating));
        expect(createdReview!.hasCustomerBeenShoppingHere).toBe(false);
        expect(createdReview!.isReplied).toBe(false);
      });
    });
  });
  // test updateRestaurantReviews
  describe('test updateRestaurantReviews', () => {
    beforeAll(async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
      const customer1 = await Customer.findOne() as ICustomer;

      await RestaurantReview.create({
        ...mockReview.review1,
        restaurantId,
        customerId: customer1._id,
      });
    });
    afterAll(async () => {
      await RestaurantReview.deleteMany({});
    });
    // error
    describe('error test', () => { 
      // should throw BadRequest if reviewid is missing
      it('should throw BadRequest if reviewid is missing', async () => {
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername,
          }
        } as unknown as Request;

        await expect(() => restaurantService.updateRestaurantReviews(req))
          .rejects.toThrow(BadRequest);

        try {
          await restaurantService.updateRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BadRequest);
          expect(error.message).toBe('Invalid Request. reviewId is missing. Please check your input data.');
        }
      });
      // should throw NotFound if restaurant username does not match with any data
      it('should throw NotFound if restaurant username does not match with any data', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: reviewId } = await RestaurantReview.findOne() as IRestaurantReview;

        const req = {
          user: { _id: customerId },
          params: {
            reviewId,
            restaurantUsername: 'notfoudnusernamerestaurant',
          }
        } as unknown as Request;

        await expect(() => restaurantService.updateRestaurantReviews(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.updateRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Restaurant Username not Found. Please input valid restaurant username.');
        }
      });
      // should throw NotFound if review Id not found (objectId)
      it('should throw NotFound if review Id not found (objectId)', async () => {
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: {
            reviewId: customerId,
            restaurantUsername,
          },
        } as unknown as Request;

        const payloadBody = {
          description: 'Deskripsi baru',
          rating: '4',
        } as DTO.RestaurantReviewBody;

        req.body = payloadBody;
        await expect(() => restaurantService.updateRestaurantReviews(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.updateRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Review id not found. Please input valid review id.');
        }
      });
      // should throw NotFound if review Id not found (random string)
      it('should throw NotFound if review Id not found (random string)', async () => {
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: {
            reviewId: 'randomid',
            restaurantUsername,
          },
        } as unknown as Request;

        const payloadBody = {
          description: 'Deskripsi baru',
          rating: '4',
        } as DTO.RestaurantReviewBody;

        req.body = payloadBody;
        await expect(() => restaurantService.updateRestaurantReviews(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.updateRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Review id not found. Please input valid review id.');
        }
      });
    });
    // success
    describe('success test', () => { 
      // should return _id of updatedReview
      it('should return _id of updatedReview', async () => {
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: reviewId } = await RestaurantReview.findOne() as IRestaurantReview;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername,
            reviewId,
          },
        } as unknown as Request;

        const payloadBody = {
          description: 'Deskripsi baru',
          rating: '3',
        } as DTO.RestaurantReviewBody;

        req.body = payloadBody;
        const updatedReviewId = 
          await restaurantService.updateRestaurantReviews(req) as DTO.RestaurantReviewsResponse['_id'];
        
        const updatedReview = await RestaurantReview.findById(updatedReviewId);

        expect(mongoose.Types.ObjectId.isValid(updatedReviewId.toString())).toBe(true);
        expect(updatedReview!.reviewDescription).toBe('Deskripsi baru');
        expect(updatedReview!.rating).toBe(3);
      });
    });
  });
  // test deleteRestaurantReviews
  describe('test deleteRestaurantReviews', () => {
    beforeAll(async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
      const customer1 = await Customer.findOne() as ICustomer;

      await RestaurantReview.create({
        ...mockReview.review1,
        restaurantId,
        customerId: customer1._id,
      });
    });
    afterAll(async () => {
      await RestaurantReview.deleteMany({});
    });
    // error
    describe('error test', () => { 
      // should throw error BadRequest if reviewId param is missing
      it('should throw error BadRequest if reviewId param is missing', async () => {
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername,
          },
        } as unknown as Request;

        await expect(() => restaurantService.deleteRestaurantReviews(req))
          .rejects.toThrow(BadRequest);

        try {
          await restaurantService.deleteRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BadRequest);
          expect(error.message).toBe('Invalid Request. reviewId is missing. Please check your input data.');
        }
      });
      // should throw error NotFound if restaurant username is not found
      it('should throw error NotFound if restaurant username is not found', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: reviewId } = await RestaurantReview.findOne() as IRestaurantReview;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername: 'notfoundrestaurantusername',
            reviewId,
          },
        } as unknown as Request;

        await expect(() => restaurantService.deleteRestaurantReviews(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.deleteRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Restaurant Username not Found. Please input valid restaurant username.');
        }
      });
      // should throw error NotFound if review with reviewId not found (objectId)
      it('should throw error NotFound if review with reviewId not found (objectId)', async () => {
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername,
            reviewId: customerId,
          },
        } as unknown as Request;

        await expect(() => restaurantService.deleteRestaurantReviews(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.deleteRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Review id not found. Please input valid review id.');
        }
      });
      // should throw error NotFound if review with reviewId not found (random string)
      it('should throw error NotFound if review with reviewId not found (random string)', async () => {
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername,
            reviewId: 'randomstring',
          },
        } as unknown as Request;

        await expect(() => restaurantService.deleteRestaurantReviews(req))
          .rejects.toThrow(NotFound);

        try {
          await restaurantService.deleteRestaurantReviews(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Review id not found. Please input valid review id.');
        }
      });
    });
    // success
    describe('success test', () => { 
      // should return _id of deleted review
      it('should throw error NotFound if review with reviewId not found (random string)', async () => {
        const { username: restaurantUsername } = await Restaurant.findOne() as IRestaurant;
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: reviewId } = await RestaurantReview.findOne() as IRestaurantReview;

        const req = {
          user: { _id: customerId },
          params: {
            restaurantUsername,
            reviewId,
          },
        } as unknown as Request;

        const deletedReviewId =
          await restaurantService.deleteRestaurantReviews(req) as DTO.RestaurantReviewsResponse['_id'];

        const deletedReview = await RestaurantReview.findById(deletedReviewId);
        expect(deletedReview).toBeNull();
      });
    });
  });
});
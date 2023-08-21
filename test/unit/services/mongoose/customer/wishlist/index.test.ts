import { Request } from 'express';
import mongoose, { mongo } from 'mongoose';

import config from '../../../../../../src/config';
import * as wishlistService from '../../../../../../src/services/mongoose/customer/wishlist';
import * as DTO from '../../../../../../src/services/mongoose/customer/wishlist/types';
import Restaurant from '../../../../../../src/models/Restaurant';
import Etalase from '../../../../../../src/models/Etalase';
import Menu, { IMenu } from '../../../../../../src/models/Menu';
import Customer, { ICustomer } from '../../../../../../src/models/Customer';
import Wishlist from '../../../../../../src/models/Wishlist';
import mockAdminResto from '../../../../../mock/adminResto';
import * as mockEtalase from '../../../../../mock/etalase';
import * as mockMenu from '../../../../../mock/menu';
import * as mockCustomer from '../../../../../mock/customer';
import { BadRequest, NotFound } from '../../../../../../src/errors';

describe('testing Wishlist service', () => {
  beforeAll(async () => {
    await mongoose.connect(config.urlDb);

    // create restaurant
    const { _id: restaurantId } = await Restaurant.create({
      ...mockAdminResto,
    });
    // create etalase
    const { _id: etalasePedasId } = await Etalase.create({
      restaurantId,
      name: mockEtalase.etalasePedas.name,
    });
    const { _id: etalaseMinumanId } = await Etalase.create({
      restaurantId,
      name: mockEtalase.etalaseMinuman.name,
    });
    // create menu
    const { _id: seblakCekerId } = await Menu.create({
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
    const { _id: jusAlpukatId } = await Menu.create({
      ...mockMenu.jusAlpukat,
      restaurantId,
      etalaseId: etalaseMinumanId,
    });
    // create customer
    const { _id: customerId } = await Customer.create({
      ...mockCustomer.customerSignup,
    });
    // create wishlist
    await Wishlist.create({ customerId, menuId: seblakCekerId });
    await Wishlist.create({ customerId, menuId: jusAlpukatId });
  });
  afterAll(async () => {
    await Wishlist.deleteMany({});
    await Customer.deleteMany({});
    await Menu.deleteMany({});
    await Etalase.deleteMany({});
    await Restaurant.deleteMany({});
    await mongoose.connection.close();
  });
  // test getAllWishlist
  describe('test getAllWishlist', () => { 
    // error
    // success
    describe('success test', () => {
      // should return data format DTO.GetAllWishlist
      it('should return data format DTO.GetAllWishlist', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;

        const req = {
          user: { _id: customerId },
        } as unknown as Request;

        const getWishlist = await wishlistService.getAllWishlist(req) as DTO.GetAllWishlist;

        expect(getWishlist.totalWishlist).toBe(2);
        expect(getWishlist.wishlistCollection).toHaveLength(2);
        expect(getWishlist.wishlistCollection[0].menu).toHaveProperty('image');
        expect(getWishlist.wishlistCollection[0].menu).toHaveProperty('slug');
        expect(getWishlist.wishlistCollection[0].menu).toHaveProperty('name');
        expect(getWishlist.wishlistCollection[0].menu).toHaveProperty('restaurant');
        expect(getWishlist.wishlistCollection[0].menu.restaurant).toHaveProperty('username');
        expect(getWishlist.wishlistCollection[0].menu.restaurant).toHaveProperty('name');
      });
    });
  });
  // test addMenuToWishlist
  describe('test addMenuToWishlist', () => {
    // error
    describe('error test', () => { 
        // should throw error BadRequest if menuId param is missing  
        it('should throw error BadRequest if menuId param is missing', async () => {
          const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;

          const req = {
            user: { _id: customerId },
            params: {},
          } as unknown as Request;

          await expect(() => wishlistService.addMenuToWishlist(req))
            .rejects.toThrow(BadRequest);

          try {
            await wishlistService.addMenuToWishlist(req);
          } catch (error: any) {
            expect(error).toBeInstanceOf(BadRequest);
            expect(error.message).toBe('Invalid Request. menuId param is missing. Please check your input data.');
          }
        });
        // should throw error NotFound if menuId not found (objectId)
        it('should throw error NotFound if menuId not found (objectId)', async () => {
          const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;

          const req = {
            user: { _id: customerId },
            params: { menuId: customerId },
          } as unknown as Request;

          await expect(() => wishlistService.addMenuToWishlist(req))
            .rejects.toThrow(NotFound);

          try {
            await wishlistService.addMenuToWishlist(req);
          } catch (error: any) {
            expect(error).toBeInstanceOf(NotFound);
            expect(error.message).toBe('Menu ID not found, please input valid menu id.');
          }
        });
        // should throw error NotFound if menuId not found (random string)
        it('should throw error NotFound if menuId not found (random string)', async () => {
          const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;

          const req = {
            user: { _id: customerId },
            params: { menuId: 'sdfjsdfu4uthruthre' },
          } as unknown as Request;

          await expect(() => wishlistService.addMenuToWishlist(req))
            .rejects.toThrow(NotFound);

          try {
            await wishlistService.addMenuToWishlist(req);
          } catch (error: any) {
            expect(error).toBeInstanceOf(NotFound);
            expect(error.message).toBe('Menu ID not found, please input valid menu id.');
          }
        });
    });
    // success
    describe('success test', () => {
      afterAll(async () => {
        const { _id: menuId } = await Menu.findOne({ slug: mockMenu.esJeruk.slug }) as IMenu;
        await Wishlist.findOneAndDelete({ menuId });
      });
      // should return _id of created wish list
      it('should return _id of created wish list', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;
        const { _id: menuId } = await Menu.findOne({ slug: mockMenu.esJeruk.slug }) as IMenu;

        const req = {
          user: { _id: customerId },
          params: { menuId },
        } as unknown as Request;

        const createdWishlistId =
          await wishlistService.addMenuToWishlist(req) as DTO.WishlisResponse['_id'];
        const createdWishlist = await Wishlist.findById(createdWishlistId);
        
        expect(mongoose.Types.ObjectId.isValid(createdWishlistId.toString())).toBe(true);
        expect(createdWishlist!.menuId.toString()).toBe(menuId.toString());
      });  
    });
  });
  // test isMenuInWishlist
  describe('test isMenuInWishlist', () => {
    // error
    describe('error test', () => {
      // should throw error BadRequest if menuId param is missing  
      it('should throw error BadRequest if menuId param is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;

        const req = {
          user: { _id: customerId },
          params: {},
        } as unknown as Request;

        await expect(() => wishlistService.isMenuInWishlist(req))
          .rejects.toThrow(BadRequest);

        try {
          await wishlistService.isMenuInWishlist(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BadRequest);
          expect(error.message).toBe('Invalid Request. menuId param is missing. Please check your input data.');
        }
      });
    });
    // success
    describe('success test', () => {
      // should return true if menuId is in wish list
      it('should return true if menuId is in wish list', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;
        const { _id: menuId } = await Menu.findOne({ slug: mockMenu.seblakCeker.slug }) as IMenu;

        const req = {
          user: { _id: customerId },
          params: { menuId },
        } as unknown as Request;

        const isMenuInWishlist = await wishlistService.isMenuInWishlist(req);
        const findWishlistWithMenu = await Wishlist.findOne({ customerId, menuId });

        expect(isMenuInWishlist).toBe(true);
        expect(findWishlistWithMenu).toBeTruthy();
      });
      // should return false if menuId is not in wish list
      it('should return false if menuId is not in wish list', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;
        const { _id: menuId } = await Menu.findOne({ slug: mockMenu.esJeruk.slug }) as IMenu;

        const req = {
          user: { _id: customerId },
          params: { menuId },
        } as unknown as Request;

        const isMenuInWishlist = await wishlistService.isMenuInWishlist(req);
        const findWishlistWithMenu = await Wishlist.findOne({ customerId, menuId });

        expect(isMenuInWishlist).toBe(false);
        expect(findWishlistWithMenu).toBeFalsy();
      });
    });
  });
  // test removeMenuFromWishlist
  describe('test removeMenuFromWishlist', () => { 
    // error
    describe('error test', () => {
      // should throw error BadRequest if menuId param is missing
      it('should throw error BadRequest if menuId param is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;

        const req = {
          user: { _id: customerId },
          params: {},
        } as unknown as Request;

        await expect(() => wishlistService.removeMenuFromWishlist(req))
          .rejects.toThrow(BadRequest);

        try {
          await wishlistService.removeMenuFromWishlist(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BadRequest);
          expect(error.message).toBe('Invalid Request. menuId param is missing. Please check your input data.');
        }
      }); 
      // should throw error NotFound if menuId not found (objectId)
      it('should throw error NotFound if menuId not found (objectId)', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;

        const req = {
          user: { _id: customerId },
          params: { menuId: customerId },
        } as unknown as Request;

        await expect(() => wishlistService.removeMenuFromWishlist(req))
          .rejects.toThrow(NotFound);

        try {
          await wishlistService.removeMenuFromWishlist(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Menu ID not found, please input valid menu id.');
        }
      });
      // should throw error NotFound if menuId not found (random string)
      it('should throw error NotFound if menuId not found (random string)', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;

        const req = {
          user: { _id: customerId },
          params: { menuId: 'sdsdfsdfsdfsdf' },
        } as unknown as Request;

        await expect(() => wishlistService.removeMenuFromWishlist(req))
          .rejects.toThrow(NotFound);

        try {
          await wishlistService.removeMenuFromWishlist(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Menu ID not found, please input valid menu id.');
        }
      });
    })
    // success
    describe('error test', () => {
      // should return _id of removed wish list  
      it('should return _id of removed wish list', async () => {
        const { _id: customerId } = await Customer.findOne() as Pick<ICustomer, '_id' | 'email'>;
        const { _id: menuId } = await Menu.findOne({ slug: mockMenu.seblakCeker.slug }) as IMenu;

        const req = {
          user: { _id: customerId },
          params: { menuId },
        } as unknown as Request;

        const removedWishlistId = await wishlistService.removeMenuFromWishlist(req);
        const findRemovedWishlist = await Wishlist.findById(removedWishlistId);

        expect(mongoose.Types.ObjectId.isValid(removedWishlistId.toString())).toBe(true)
        expect(findRemovedWishlist).toBeFalsy();
      });
    });
  });
});

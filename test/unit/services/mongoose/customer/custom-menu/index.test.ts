import mongoose, { mongo } from 'mongoose';
import { Request } from 'express';
import { ZodError } from 'zod';

import config from '../../../../../../src/config';
import PickedCustomMenuComposition from '../../../../../../src/models/PickedCustomMenuComposition';
import CustomMenu, { ICustomMenu } from '../../../../../../src/models/CustomMenu';
import Customer, { ICustomer } from '../../../../../../src/models/Customer';
import CustomMenuComposition, { ICustomMenuComposition } from '../../../../../../src/models/CustomMenuComposition';
import CustomMenuCategory, { ICustomMenuCategory } from '../../../../../../src/models/CustomMenuCategory';
import CustomMenuCategorySpicyLevel from '../../../../../../src/models/CustomMenuCategorySpicyLevel';
import Restaurant, { IRestaurant } from '../../../../../../src/models/Restaurant';
import * as customMenuService from '../../../../../../src/services/mongoose/customer/custom-menu';
import * as DTO from '../../../../../../src/services/mongoose/customer/custom-menu/types';

import mockAdminResto from '../../../../../mock/adminResto'; 
import * as mockCustomMenuCategory from '../../../../../mock/customMenuCategory'; 
import { withSpicy as mockCustomMenuComposition } from '../../../../../mock/customMenuComposition'; 
import { customerSignup as mockCustomer } from '../../../../../mock/customer';
import * as mockCustomMenu from '../../../../../mock/customMenu';
import { BadRequest, NotFound } from '../../../../../../src/errors';

describe('testing custom menu feature', () => {
  beforeAll(async () => {
    await mongoose.connect(config.urlDb);

    // create restaurant /
    const restaurant = await Restaurant.create({
      username: mockAdminResto.username,
      name: mockAdminResto.name,
      email: mockAdminResto.email,
      password: mockAdminResto.password,
      isVerified: true,
    });
    // create custom menu category /
    const customMenuCategoryPedas = await CustomMenuCategory.create({
      restaurantId: restaurant._id,
      name: mockCustomMenuCategory.withSpicy.name,
      isBungkusAble: mockCustomMenuCategory.withSpicy.isBungkusAble,
    });
    // create custom menu category spicy level
    await CustomMenuCategorySpicyLevel.create({
      customMenuCategoryId: customMenuCategoryPedas._id,
      maxSpicy: 5,
    });
    // create custom menu composition /
    const compositionKerupukKakap = await CustomMenuComposition.create({
      restaurantId: restaurant._id,
      customMenuCategoryId: customMenuCategoryPedas._id,
      name: mockCustomMenuComposition.kerupukKakap.name,
      description: mockCustomMenuComposition.kerupukKakap.description,
      stock: mockCustomMenuComposition.kerupukKakap.stock,
      price: mockCustomMenuComposition.kerupukKakap.price,
      image1: mockCustomMenuComposition.kerupukKakap.images[0],
      image2: mockCustomMenuComposition.kerupukKakap.images[0],
    });
    const compositionTelurAyam = await CustomMenuComposition.create({
      restaurantId: restaurant._id,
      customMenuCategoryId: customMenuCategoryPedas._id,
      name: mockCustomMenuComposition.telurAyam.name,
      description: mockCustomMenuComposition.telurAyam.description,
      stock: mockCustomMenuComposition.telurAyam.stock,
      price: mockCustomMenuComposition.telurAyam.price,
      image1: mockCustomMenuComposition.telurAyam.images[0],
      image2: mockCustomMenuComposition.telurAyam.images[0],
    });
    const compositionSosis = await CustomMenuComposition.create({
      restaurantId: restaurant._id,
      customMenuCategoryId: customMenuCategoryPedas._id,
      name: mockCustomMenuComposition.sosis.name,
      description: mockCustomMenuComposition.sosis.description,
      stock: mockCustomMenuComposition.sosis.stock,
      price: mockCustomMenuComposition.sosis.price,
      image1: mockCustomMenuComposition.sosis.images[0],
      image2: mockCustomMenuComposition.sosis.images[0],
    });
    // create customer /
    const customer = await Customer.create({
      username: mockCustomer.username,
      name: mockCustomer.name,
      email: mockCustomer.email,
      password: mockCustomer.password,
      isVerified: true,
    });
    // create custom menu /
    const customMenuSeblakFavoritKu = await CustomMenu.create({
      customerId: customer._id,
      restaurantId: restaurant._id,
      customMenuCategoryId: customMenuCategoryPedas._id,
      name: mockCustomMenu.customMenuSeblak.name,
      price: mockCustomMenu.customMenuSeblak.price,
    });
    const customMenuSeblakTelur = await CustomMenu.create({
      customerId: customer._id,
      restaurantId: restaurant._id,
      customMenuCategoryId: customMenuCategoryPedas._id,
      name: mockCustomMenu.customMenuSeblakTelur.name,
      price: mockCustomMenu.customMenuSeblakTelur.price,
    });
    const customMenuSeblakSosis = await CustomMenu.create({
      customerId: customer._id,
      restaurantId: restaurant._id,
      customMenuCategoryId: customMenuCategoryPedas._id,
      name: mockCustomMenu.customMenuSeblakSosis.name,
      price: mockCustomMenu.customMenuSeblakSosis.price,
    });
    // create picked custom menu composition
    // seblak favoritku
    await PickedCustomMenuComposition.create([
      {
        customMenuId: customMenuSeblakFavoritKu._id,
        customMenuCompositionId: compositionKerupukKakap._id,
        qty: 4,
      },
      {
        customMenuId: customMenuSeblakFavoritKu._id,
        customMenuCompositionId: compositionTelurAyam._id,
        qty: 2,
      },
      {
        customMenuId: customMenuSeblakFavoritKu._id,
        customMenuCompositionId: compositionSosis._id,
        qty: 2,
      },
    ]);
    // seblak telur
    await PickedCustomMenuComposition.create({
      customMenuId: customMenuSeblakTelur._id,
      customMenuCompositionId: compositionTelurAyam._id,
      qty: 2,
    });
    // sosis
    await PickedCustomMenuComposition.create({
      customMenuId: customMenuSeblakSosis._id,
      customMenuCompositionId: compositionSosis._id,
      qty: 6,
    });
  });
  afterAll(async () =>{
    await Restaurant.deleteMany({});
    await CustomMenuCategory.deleteMany({});
    await CustomMenuComposition.deleteMany({});
    await Customer.deleteMany({});
    await CustomMenu.deleteMany({});
    await PickedCustomMenuComposition.deleteMany({});
    await mongoose.connection.close();
  });
  // test getAllCustomMenu
  describe('test getAllCustomMenu', () => {
    // error
    // success
    describe('success test', () => {
      // should return DTO.GetAllCustomMenuResponse valid data
      it('should return DTO.GetAllCustomMenuResponse valid data', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer; 
        const restaurant = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
        } as unknown as Request;

        const customMenus =
          await customMenuService.getAllCustomMenu(req) as DTO.GetAllCustomMenuResponse;

        expect(customMenus).toHaveLength(3);
        expect(customMenus[0]).toHaveProperty('_id');
        expect(customMenus[0]).toHaveProperty('createdAt');
        expect(customMenus[0]).toHaveProperty('image');
        expect(customMenus[0]).toHaveProperty('restaurant');

        expect(customMenus[0].image).toBe(restaurant.avatar);
        expect(customMenus[0].restaurant._id.toString()).toBe(restaurant._id.toString());
        expect(customMenus[0].restaurant.username).toBe(restaurant.username);
        expect(customMenus[0].restaurant.name).toBe(restaurant.name);
      });
    });
  });
  // test createCustomMenu
  describe('test createCustomMenu', () => {
    // error
    describe('error test', () => { 
      // should throw error ZodError if \'restaurantId\' is missing
      it('should throw error ZodError if \'restaurantId\' is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: undefined as unknown as string,
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('restaurantId');
          expect(error.errors[0].message).toBe('restaurantId harus diisi.');
        }
      });
      // should throw error ZodError if \'restaurantId\' is not string
      it('should throw error ZodError if \'restaurantId\' is not string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: 0 as unknown as string,
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('restaurantId');
          expect(error.errors[0].message).toBe('restaurantId harus diisi dengan string.');
        }
      });
      // should throw error ZodError if \'customMenuCategoryId\' is missing
      it('should throw error ZodError if \'customMenuCategoryId\' is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: undefined as unknown as string,
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('customMenuCategoryId');
          expect(error.errors[0].message).toBe('customMenuCategoryId harus diisi.');
        }
      });
      // should throw error ZodError if \'customMenuCategoryId\' is not string
      it('should throw error ZodError if \'customMenuCategoryId\' is not string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: 0 as unknown as string,
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('customMenuCategoryId');
          expect(error.errors[0].message).toBe('customMenuCategoryId harus diisi dengan string.');
        }
      });
      // should throw error NotFound if \'customMenuCategoryId\' is random string
      it('should throw error ZodError if \'customMenuCategoryId\' is random string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: 'sdsdsdsd',
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(NotFound);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('customMenuCategoryId is not found. Please input valid customMenuCategoryId.');
        }
      });
      // should throw error NotFound if \'customMenuCategoryId\' is not found
      it('should throw error ZodError if \'customMenuCategoryId\' is not found', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customerId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(NotFound);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('customMenuCategoryId is not found. Please input valid customMenuCategoryId.');
        }
      });
      // should throw error ZodError if \'name\' is missing
      it('should throw error ZodError if \'name\' is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: undefined as unknown as string,
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Nama harus diisi.');
        }
      });
      // should throw error ZodError if \'name\' is not string
      it('should throw error ZodError if \'name\' is not string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 0 as unknown as string,
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Nama harus diisi dengan string.');
        }
      });
      // should throw error ZodError if \'name\' is empty string
      it('should throw error ZodError if \'name\' is empty string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: '',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Nama minimal memiliki 1 karakter.');
        }
      });
      // should throw error ZodError if \'name\' has more than 80 chars
      it('should throw error ZodError if \'name\' has more than 80 chars', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'fgsdfgsdfgkfdjkgsjkdfgjkdfhgjkdfhjkgndfjkvndjfnjdfngjfgsdfhjksdfjksdfjhxcvxcvxcvxcvxcvxcvxcsdf',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Nama maksimal memiliki 80 karakter.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' is missing
      it('should throw error ZodError if \'pickedCustomMenuComposition\' is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: undefined as unknown as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('Composisi harus diisi.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' is not array
      it('should throw error ZodError if \'pickedCustomMenuComposition\' is not array', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: '' as unknown as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('Composisi harus berupa array.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' has no item
      it('should throw error ZodError if \'pickedCustomMenuComposition\' has no item', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [] as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('Custom menu setidaknya memiliki 1 komposisi.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' id item is missing
      it('should throw error ZodError if \'pickedCustomMenuComposition\' id item is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [{
            qty: 10,
          }] as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('_id composition harus diisi.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' id item is not string
      it('should throw error ZodError if \'pickedCustomMenuComposition\' id item is not string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [{
            _id: 10 as any,
            qty: 10,
          }] as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('_id composition harus diisi dengan string.');
        }
      });
      // should throw error NotFound if \'pickedCustomMenuComposition\' id item is random string
      it('should throw error ZodError if \'pickedCustomMenuComposition\' id item is random string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [{
            _id: 'sdfsdfsdfsdf',
            qty: 10,
          }] as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(NotFound);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('customMenuCompositionId is not found. Please input valid customMenuCompositionId.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' qty item is missing
      it('should throw error ZodError if \'pickedCustomMenuComposition\' qty item is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: undefined as any,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('Qty harus diisi.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' qty item is not number
      it('should throw error ZodError if \'pickedCustomMenuComposition\' qty item is not number', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 'hello' as any,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('Qty harus diisi dengan number.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' qty item is 0
      it('should throw error ZodError if \'pickedCustomMenuComposition\' qty item is not number', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 0,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('Composisi yang dipilih setidaknya memiliki 1 qty.');
        }
      });
      // should throw error NotFound if \'pickedCustomMenuComposition\' id is not found
      it('should throw error ZodError if \'pickedCustomMenuComposition\' id is not found', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Sebak Telur Sosis Pedas',
          pickedCustomMenuComposition: [{
            _id: customerId.toString(),
            qty: 10,
          }],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.createCustomMenu(req))
          .rejects.toThrow(NotFound);

        try {
          await customMenuService.createCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('customMenuCompositionId is not found. Please input valid customMenuCompositionId.');
        }
      });
    });
    // success
    describe('success test', () => { 
      // should return _id of created custom menu
      it('should return _id of created custom menu', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;
        const { _id: compositionSosisId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.sosis.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.CreateCustomMenuRequestBody = {
          restaurantId: restaurantId.toString(),
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'Seblak Telur Sosis Pedas',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            },
            {
              _id: compositionSosisId.toString(),
              qty: 2,
            }
          ],
          // total 8000
        };

        req.body = payloadBody;
        const createdCustomMenuId =
          await customMenuService.createCustomMenu(req) as ICustomMenu['_id'];

        const createdCustomMenu = await CustomMenu.findById(createdCustomMenuId) as ICustomMenu;
        const pickedCustomMenus = await PickedCustomMenuComposition.find({
          customMenuId: createdCustomMenuId,
        });

        expect(mongoose.Types.ObjectId.isValid(createdCustomMenuId.toString()))
          .toBe(true);
        expect(createdCustomMenu.customerId.toString()).toBe(customerId.toString());
        expect(createdCustomMenu.restaurantId.toString()).toBe(restaurantId.toString());
        expect(createdCustomMenu.customMenuCategoryId.toString()).toBe(customMenuCategoryId.toString());
        expect(createdCustomMenu.name).toBe('Seblak Telur Sosis Pedas');
        expect(createdCustomMenu.price).toBe(8000);
        expect(pickedCustomMenus).toHaveLength(2);
        expect(pickedCustomMenus[0]).toHaveProperty('_id');
        expect(pickedCustomMenus[0]).toHaveProperty('customMenuCompositionId');
        expect(pickedCustomMenus
          .find((item) =>
            item.customMenuCompositionId.toString() === compositionTelurAyamId.toString())!.qty)
          .toBe(2);
      });
    });
  });
  // test getCustomMenuById
  describe('test getCustomMenuById', () => {
    // error
    describe('error test', () => {
      // should throw error NotFound if customMenuId is not found (objectId)
      it('should throw error NotFound if customMenuId is not found (objectId)', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: { customMenuId: customerId },
        } as unknown as Request;

        await expect(() => customMenuService.getCustomMenuById(req))
          .rejects.toThrow(NotFound);

        try {
          
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Custom Menu Id not found. Please input valid custom menu id.');
        }
      });
      // should throw error NotFound if customMenuId is not found (random string)
      it('should throw error NotFound if customMenuId is not found (random string)', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: { customMenuId: 'sdfsdfsdf' },
        } as unknown as Request;

        await expect(() => customMenuService.getCustomMenuById(req))
          .rejects.toThrow(NotFound);

        try {
          
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Custom Menu Id not found. Please input valid custom menu id.');
        }
      });
    });
    // success
    describe('success test', () => {
      // should return DTO.CustomMenuResponse
      it('should return DTO.CustomMenuResponse', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomer;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
        } as unknown as Request;

        const customMenu = await customMenuService.getCustomMenuById(req) as DTO.CustomMenuResponse;

        expect(customMenu).toHaveProperty('_id');
        expect(customMenu).toHaveProperty('createdAt');
        expect(customMenu.name).toBe(mockCustomMenu.customMenuSeblak.name);
        expect(customMenu.image).toBe(mockAdminResto.avatar);
        expect(customMenu.restaurant.username).toBe(mockAdminResto.username);
        expect(customMenu.restaurant.name).toBe(mockAdminResto.name);
        expect(customMenu.customMenuCategory.isBungkusAble)
          .toBe(mockCustomMenuCategory.withSpicy.isBungkusAble);
        expect(customMenu.customMenuCategory.name)
          .toBe(mockCustomMenuCategory.withSpicy.name);
        expect(customMenu.pickedCustomMenuCompositions).toHaveLength(3);
      });
    });
  });
  // test updateCustomMenu
  describe('test updateCustomMenu', () => {});
    // error
    describe('error test', () => {
      // should throw error BadRequest if customMenuId param is missing
      it('should throw error ZodError if customMenuId param is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;

        const req = {
          user: { _id: customerId },
          params: {},
        } as unknown as Request;

        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(BadRequest);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BadRequest);
          expect(error.message).toBe('Invalid input. customMenuId param is missing.');
        }
      });
      // should throw error NotFound if customMenuId is not found (objectId)
      it('should throw error NotFound if customMenuId is not found (objectId)', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          params: {
            customMenuId: customerId.toString(),
          },
          body: {}
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'Nama Diedit',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 10,
            },
            // total 25000
          ],
        };
        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(NotFound);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Custom Menu Id not found. Please input valid custom menu id.');
        }
      });
      // should throw error NotFound if customMenuId is not found (random string)
      it('should throw error NotFound if customMenuId is not found (random string)', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          params: {
            customMenuId: 'sdsdsd',
          },
          body: {}
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'Nama Diedit',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 10,
            },
            // total 25000
          ],
        };
        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(NotFound);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Custom Menu Id not found. Please input valid custom menu id.');
        }
      });
      // should throw error ZodError if \'name\' is missing
      it('should throw error ZodError if \'name\' is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } = await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: undefined as unknown as string,
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Nama harus diisi.');
        }
      });
      // should throw error ZodError if \'name\' is not string
      it('should throw error ZodError if \'name\' is not string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 10 as unknown as string,
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Nama harus diisi dengan string.');
        }
      });
      // should throw error ZodError if \'name\' has empty string
      it('should throw error ZodError if \'name\' has empty string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: '',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Nama minimal memiliki 1 karakter.');
        }
      });
      // should throw error ZodError if \'name\' has more than 80 chars
      it('should throw error ZodError if \'name\' has empty string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'fgsdfgsdfgkfdjkgsjkdfgjkdfhgjkdfhjkgndfjkvndjfnjdfngjfgsdfhjksdfjksdfjhxcvxcdfdfsd',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 2,
            }
          ],
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Nama maksimal memiliki 80 karakter.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' is missing
      it('should throw error ZodError if \'pickedCustomMenuComposition\' is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'Nama diedit',
          pickedCustomMenuComposition: undefined as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('Composisi harus diisi.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' is not array
      it('should throw error ZodError if \'pickedCustomMenuComposition\' is not array', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'Nama diedit',
          pickedCustomMenuComposition: 90 as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('Composisi harus berupa array.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' has no item
      it('should throw error ZodError if \'pickedCustomMenuComposition\' is not array', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'Nama diedit',
          pickedCustomMenuComposition: [] as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('Custom menu setidaknya memiliki 1 komposisi.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' id item is missing
      it('should throw error ZodError if \'pickedCustomMenuComposition\' id item is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'Nama diedit',
          pickedCustomMenuComposition: [
            {
              qty: 10,
            },
          ] as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('_id composition harus diisi.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' id item is not string
      it('should throw error ZodError if \'pickedCustomMenuComposition\' id item is not string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'Nama diedit',
          pickedCustomMenuComposition: [
            {
              _id: [],
              qty: 10,
            },
          ] as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('_id composition harus diisi dengan string.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' qty item is missing
      it('should throw error ZodError if \'pickedCustomMenuComposition\' qty item is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'Nama diedit',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: undefined,
            },
          ] as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('Qty harus diisi.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' qty item is not number
      it('should throw error ZodError if \'pickedCustomMenuComposition\' qty item is not number', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'Nama diedit',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 'heheheheh',
            },
          ] as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('Qty harus diisi dengan number.');
        }
      });
      // should throw error ZodError if \'pickedCustomMenuComposition\' qty item is 0
      it('should throw error ZodError if \'pickedCustomMenuComposition\' qty item is 0', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'Nama diedit',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 0,
            },
          ] as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(ZodError);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('pickedCustomMenuComposition');
          expect(error.errors[0].message).toBe('Composisi yang dipilih setidaknya memiliki 1 qty.');
        }
      });
      // should throw error NotFound if \'pickedCustomMenuComposition\' id item is random string
      it('should throw error ZodError if \'pickedCustomMenuComposition\' id item is random string', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'Nama diedit',
          pickedCustomMenuComposition: [
            {
              _id: 'randomstringsayang',
              qty: 10,
            },
          ] as any,
        };

        req.body = payloadBody;
        await expect(() => customMenuService.updateCustomMenu(req))
          .rejects.toThrow(NotFound);

        try {
          await customMenuService.updateCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('customMenuCompositionId is not found. Please input valid customMenuCompositionId.');
        }
      });
    });
    // success
    describe('success test', () => {
      // should return _id of updated custom menu
      it('should return _id of updated custom menu', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const { _id: compositionTelurAyamId } =
          await CustomMenuComposition
            .findOne({ name: mockCustomMenuComposition.telurAyam.name }) as ICustomMenuComposition;
        const { _id: customMenuId } =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblakTelur.name }) as ICustomMenu;

        const req = {
          user: { _id: customerId },
          params: { customMenuId },
          body: {},
        } as unknown as Request;

        const payloadBody: DTO.UpdateCustomMenuRequestBody = {
          name: 'Nama Diedit',
          pickedCustomMenuComposition: [
            {
              _id: compositionTelurAyamId.toString(),
              qty: 10,
            },
            // total 25000
          ],
        };

        req.body = payloadBody;
        const updatedCustomMenuId = 
          await customMenuService.updateCustomMenu(req) as DTO.CustomMenuResponse['_id'];
        const updatedCustomMenu =
          await CustomMenu.findById(updatedCustomMenuId) as ICustomMenu;
        const pickedUpdatedCustomMenus =
          await PickedCustomMenuComposition.find({ customMenuId: updatedCustomMenuId });

        expect(mongoose.Types.ObjectId.isValid(updatedCustomMenuId.toString()))
          .toBe(true);
        expect(updatedCustomMenu.customerId.toString()).toBe(customerId.toString());
        expect(updatedCustomMenu.name).toBe('Nama Diedit');
        expect(updatedCustomMenu.price).toBe(25000);
        expect(pickedUpdatedCustomMenus).toHaveLength(1);
        expect(pickedUpdatedCustomMenus[0]).toHaveProperty('_id');
        expect(pickedUpdatedCustomMenus[0]).toHaveProperty('customMenuCompositionId');
        expect(pickedUpdatedCustomMenus
          .find((item) =>
            item.customMenuCompositionId.toString() === compositionTelurAyamId.toString())!.qty)
          .toBe(10);
      });
    });
  // test deleteCustomMenu
  describe('test deleteCustomMenu', () => {
    // error
    describe('error test', () => {
      // should throw error BadRequest if customMenuId param is missing
      it('should throw error ZodError if customMenuId param is missing', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
  
        const req = {
          user: { _id: customerId },
          params: {},
        } as unknown as Request;
  
        await expect(() => customMenuService.deleteCustomMenu(req))
          .rejects.toThrow(BadRequest);
  
        try {
          await customMenuService.deleteCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(BadRequest);
          expect(error.message).toBe('Invalid input. customMenuId param is missing.');
        }
      });
      // should throw error NotFound if customMenuId is not found (objectId)
      it('should throw error NotFound if customMenuId is not found (objectId)', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
  
        const req = {
          user: { _id: customerId },
          params: { customMenuId: customerId },
        } as unknown as Request;
  
        await expect(() => customMenuService.deleteCustomMenu(req))
          .rejects.toThrow(NotFound);
  
        try {
          await customMenuService.deleteCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Custom Menu Id not found. Please input valid custom menu id.');
        }
      });
      // should throw error NotFound if customMenuId is not found (random string)
      it('should throw error NotFound if customMenuId is not found (random string)', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
  
        const req = {
          user: { _id: customerId },
          params: { customMenuId: 'dfdfdfdf' },
        } as unknown as Request;
  
        await expect(() => customMenuService.deleteCustomMenu(req))
          .rejects.toThrow(NotFound);
  
        try {
          await customMenuService.deleteCustomMenu(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(NotFound);
          expect(error.message).toBe('Custom Menu Id not found. Please input valid custom menu id.');
        }
      });
    });
    // success
    describe('success test', () => {
      // should return _id of deleted custom menu
      it('should return _id of deleted custom menu', async () => {
        const { _id: customerId } = await Customer.findOne() as ICustomer;
        const customMenu =
          await CustomMenu.findOne({ name: mockCustomMenu.customMenuSeblak.name }) as ICustomMenu;
  
        const req = {
          user: { _id: customerId },
          params: { customMenuId: customMenu._id },
        } as unknown as Request;
  
        const pickedCompositionBeforeDelete =
          await PickedCustomMenuComposition.find({ customMenuId: customMenu._id });
  
        const deletedCustomMenuId =
          await customMenuService.deleteCustomMenu(req) as DTO.CustomMenuResponse['_id'];
  
        const checkDeletedCustomMenu =
          await CustomMenu.findById(deletedCustomMenuId);
        const deletedPickedCustomMenuComposition =
          await PickedCustomMenuComposition.find({ customMenuId: deletedCustomMenuId });
  
        expect(customMenu).toBeTruthy();
        expect(pickedCompositionBeforeDelete).toHaveLength(3);
        expect(mongoose.Types.ObjectId.isValid(deletedCustomMenuId.toString()))
          .toBe(true);
        expect(checkDeletedCustomMenu).toBeNull();
        expect(deletedPickedCustomMenuComposition).toStrictEqual([]);
      });
    });
  });
});

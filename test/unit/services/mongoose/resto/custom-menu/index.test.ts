import mongoose from 'mongoose';
import config from '../../../../../../src/config';
import Restaurant, { IRestaurant } from '../../../../../../src/models/Restaurant';
import CustomMenuCategory, { ICustomMenuCategory } from '../../../../../../src/models/CustomMenuCategory';
import {
  createCustomMenuCategory,
  createCustomMenuComposition,
  deleteCustomMenuCategory,
  deleteCustomMenuComposition,
  getAllCustomMenuCategory,
  getAllCustomMenuComposition,
  getSpecificCustomMenuCategory,
  getSpecificCustomMenuComposition,
  updateCustomMenuCategory,
  updateCustomMenuComposition
} from '../../../../../../src/services/mongoose/resto/custom-menu';
import * as composition from '../../../../../mock/customMenuComposition';
import * as category from '../../../../../mock/customMenuCategory';
import mockAdminRestoUser from '../../../../../mock/adminResto';
import { Request } from 'express';
import CustomMenuCategorySpicyLevel from '../../../../../../src/models/CustomMenuCategorySpicyLevel';
import { ZodError, custom } from 'zod';
import { BadRequest, NotFound } from '../../../../../../src/errors';
import CustomMenuComposition, { ICustomMenuComposition } from '../../../../../../src/models/CustomMenuComposition';

import moreThan3000chars from '../../../../../mock/randomString';
import * as DTO from '../../../../../../src/services/mongoose/resto/custom-menu/types';

describe('testing Custom Menu Category Functionality', () => {
  // test getAllCustomMenuCategory
  describe('test getAllCustomMenuCategory', () => {
    // success
    describe('success test', () => { 
      beforeEach(async () => {
        await mongoose.connect(config.urlDb);
        const restaurant = await Restaurant.create({
          username: mockAdminRestoUser.username,
          name: mockAdminRestoUser.name,
          email: mockAdminRestoUser.email,
          password: mockAdminRestoUser.password,
        });

        const req = {
          user: { _id: restaurant._id },
        } as unknown as Request;
        req.body = category.withSpicy;
        await createCustomMenuCategory(req);
        req.body = category.withoutSpicy;
        await createCustomMenuCategory(req);
      });
      afterEach(async () => {
        await Restaurant.deleteMany({});
        await CustomMenuCategory.deleteMany({});
        await CustomMenuCategorySpicyLevel.deleteMany({});
        await mongoose.connection.close();
      });
      // should return array of DTO.CustomMenuCategoryResponse with id and name
      it('should return array of DTO.CustomMenuCategoryResponse with id and name', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const req = {
          user: { _id: restaurantId },
        } as unknown as Request;
        const customMenuCategories =
          await getAllCustomMenuCategory(req) as Pick<DTO.CustomMenuCategoryResponse, "name" | "_id">[];

        expect(customMenuCategories).toHaveLength(2);
        expect(customMenuCategories[0]).toHaveProperty('_id');
        expect(customMenuCategories[0]).toHaveProperty('name');
      });
      // should return empty array
      it('should return empty array', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const req = {
          user: { _id: restaurantId },
        } as unknown as Request;
        await CustomMenuCategory.deleteMany({});
        const customMenuCategories = await getAllCustomMenuCategory(req);

        expect(customMenuCategories).toHaveLength(0);
      });
    });
  });
  // test createCustomMenuCategory
  describe('test createCustomMenuCategory', () => {
    // error
    describe('error test', () => {
      beforeEach(async () => {
        await mongoose.connect(config.urlDb);
        await Restaurant.create({
          username: mockAdminRestoUser.username,
          name: mockAdminRestoUser.name,
          email: mockAdminRestoUser.email,
          password: mockAdminRestoUser.password,
        });
      });
      afterEach(async () => {
        await Restaurant.deleteMany({});
        await CustomMenuCategory.deleteMany({});
        await CustomMenuCategorySpicyLevel.deleteMany({});
        await mongoose.connection.close();
      });
      // should throw error Zod Error if 'name' is missing in the request body
      it('should throw error Zod Error if \'name\' is missing in the request body', async () =>{
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          body: {}
        } as unknown as Request;
        
        await expect(() => createCustomMenuCategory(req)).rejects.toThrow(ZodError);
        try {
          await createCustomMenuCategory(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Required');
        }

        const customMenuCategoryExist = await CustomMenuCategory.findOne();
        expect(customMenuCategoryExist).toBeNull();
      });
      // should throw error Zod Error if 'name' is has more than 50 chars
      it('should throw error Zod Error if \'name\' is has more than 50 chars', async () =>{
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          body: {
            ...category.withSpicy,
            name: 'fgsdfgsdfgkfdjkgsjkdfgjkdfhgjkdfhjkgndfjkvndjfnjdfngjfgsdfhjksdfjksdfjh'
          }
        } as unknown as Request;

        await expect(() => createCustomMenuCategory(req)).rejects.toThrow(ZodError);
        try {
          await createCustomMenuCategory(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('String must contain at most 50 character(s)');
        }

        const customMenuCategoryExist = await CustomMenuCategory.findOne();
        expect(customMenuCategoryExist).toBeNull();
      });
    });
    describe('success test', () => {
      beforeEach(async () => {
        await mongoose.connect(config.urlDb);
        await Restaurant.create({
          username: mockAdminRestoUser.username,
          name: mockAdminRestoUser.name,
          email: mockAdminRestoUser.email,
          password: mockAdminRestoUser.password,
        });
      });
      afterEach(async () => {
        await Restaurant.deleteMany({});
        await CustomMenuCategory.deleteMany({});
        await CustomMenuCategorySpicyLevel.deleteMany({});
        await mongoose.connection.close();
      });
      // should return _id of valid created custom menu category (with spicy level)
      it('should return _id of valid created custom menu category (with spicy level)', async () =>{
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          body: {
            ...category.withSpicy,
          }
        } as unknown as Request;

        const customMenucategory = await createCustomMenuCategory(req);
        // behaviour
        expect(mongoose.Types.ObjectId.isValid(customMenucategory.toString())).toBe(true);
        // implementation
        const findCustomMenuCategory = await CustomMenuCategory.findById(customMenucategory);
        const findCustomMenuCategorySpicyLevel = 
          await CustomMenuCategorySpicyLevel.findOne({
            customMenuCategoryId: findCustomMenuCategory!._id,
          });
        expect(findCustomMenuCategory!.name).toBe(category.withSpicy.name);
        expect(findCustomMenuCategory!.isBungkusAble).toBe(category.withSpicy.isBungkusAble);
        expect(findCustomMenuCategorySpicyLevel!.maxSpicy).toBe(category.withSpicy.maxSpicy);
      });
      // should return _id of valid created custom menu category (without spicy level)
      it('should return _id of valid created custom menu category (without spicy level)', async () =>{
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          body: {
            ...category.withoutSpicy,
          }
        } as unknown as Request;

        const customMenucategory = await createCustomMenuCategory(req);
        // behaviour
        expect(mongoose.Types.ObjectId.isValid(customMenucategory.toString())).toBe(true);
        // implementation
        const findCustomMenuCategory = await CustomMenuCategory.findById(customMenucategory);
        expect(findCustomMenuCategory!.name).toBe(category.withoutSpicy.name);
        expect(findCustomMenuCategory!.isBungkusAble).toBe(category.withoutSpicy.isBungkusAble);
      });
    });
  })
  // test getSpecificCustomMenuCategory
  describe('test getSpecificCustomMenuCategory', () => {
    // error
    describe('error tset', () => {
      beforeEach(async () => {
        await mongoose.connect(config.urlDb);
        const restaurant = await Restaurant.create({
          username: mockAdminRestoUser.username,
          name: mockAdminRestoUser.name,
          email: mockAdminRestoUser.email,
          password: mockAdminRestoUser.password,
        });

        const req = {
          user: { _id: restaurant._id },
        } as unknown as Request;
        req.body = category.withSpicy;
        await createCustomMenuCategory(req);
      });
      afterEach(async () => {
        await Restaurant.deleteMany({});
        await CustomMenuCategory.deleteMany({});
        await CustomMenuCategorySpicyLevel.deleteMany({});
        await mongoose.connection.close();
      });
      // should throw error NotFound if custom menu category with id (objectid) is not found
      it('should throw error NotFound if custom menu category with id (objectid) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        // 60a78c2dcf451a001c75248f
        const req = {
          user: { _id: restaurantId },
          params: { categoryId: '60a78c2dcf451a001c75248f' }
        } as unknown as Request;

        // behaviour
        await expect(() => getSpecificCustomMenuCategory(req)).rejects.toThrow(NotFound);

        // implementation
        const checkCategoryExists = await CustomMenuCategory.findOne();
        expect(checkCategoryExists).toBeTruthy();
      });
      // should throw error NotFound if custom menu category with id (random string) is not found
      it('should throw error NotFound if custom menu category with id (random string) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        // 60a78c2dcf451a001c75248f
        const req = {
          user: { _id: restaurantId },
          params: { categoryId: 'sssdsdsd' }
        } as unknown as Request;

        // behaviour
        await expect(() => getSpecificCustomMenuCategory(req)).rejects.toThrow(NotFound);

        // implementation
        const checkCategoryExists = await CustomMenuCategory.findOne();
        expect(checkCategoryExists).toBeTruthy();
      });
    });
    // success
    describe('success test', () => {
      beforeEach(async () => {
        await mongoose.connect(config.urlDb);
        const restaurant = await Restaurant.create({
          username: mockAdminRestoUser.username,
          name: mockAdminRestoUser.name,
          email: mockAdminRestoUser.email,
          password: mockAdminRestoUser.password,
        });

        const req = {
          user: { _id: restaurant._id },
        } as unknown as Request;
        req.body = category.withSpicy;
        await createCustomMenuCategory(req);
        req.body = category.withoutSpicy;
        await createCustomMenuCategory(req);
      });
      afterEach(async () => {
        await Restaurant.deleteMany({});
        await CustomMenuCategory.deleteMany({});
        await CustomMenuCategorySpicyLevel.deleteMany({});
        await mongoose.connection.close();
      });
      // should return DTO.CustomMenuCategoryResponse with maxSpicy has value
      it('should return DTO.CustomMenuCategoryResponse with maxSpicy has value', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const findCustomMenuCategorySpicyLevel = await CustomMenuCategorySpicyLevel.findOne();
        const req = {
          user: { _id: restaurantId },
          params: {
            categoryId: findCustomMenuCategorySpicyLevel!.customMenuCategoryId }
        } as unknown as Request;
        const customMenuCategory = 
          await getSpecificCustomMenuCategory(req) as DTO.CustomMenuCategoryResponse;

        // behaviour
        expect(customMenuCategory).toHaveProperty('_id');
        expect(customMenuCategory).toHaveProperty('name');
        expect(customMenuCategory).toHaveProperty('isBungkusAble');
        expect(customMenuCategory).toHaveProperty('maxSpicy');
        expect(customMenuCategory.maxSpicy)
          .toBe(findCustomMenuCategorySpicyLevel!.maxSpicy);
      });
      // should return DTO.CustomMenuCategoryResponse with maxSpicy is null
      it('should return DTO.CustomMenuCategoryResponse with maxSpicy is null', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const findCustomMenuCategorySpicyLevel = await CustomMenuCategorySpicyLevel.findOne();
        const findCategory = await CustomMenuCategory.findOne({ 
          _id: { $ne: findCustomMenuCategorySpicyLevel!.customMenuCategoryId }, 
        });
        const req = {
          user: { _id: restaurantId },
          params: {
            categoryId: findCategory!._id }
        } as unknown as Request;
        const customMenuCategory = 
          await getSpecificCustomMenuCategory(req) as DTO.CustomMenuCategoryResponse;

        // behaviour
        expect(customMenuCategory).toHaveProperty('_id');
        expect(customMenuCategory).toHaveProperty('name');
        expect(customMenuCategory).toHaveProperty('isBungkusAble');
        expect(customMenuCategory).toHaveProperty('maxSpicy');
        expect(customMenuCategory.maxSpicy).toBeNull();
      });
    });
  });
  // test updateCustomMenuCategory
  describe('test updateCustomMenuCategory', () => { 
    // error
    describe('error test', () => {       
      beforeEach(async () => {
        await mongoose.connect(config.urlDb);
        const restaurant = await Restaurant.create({
          username: mockAdminRestoUser.username,
          name: mockAdminRestoUser.name,
          email: mockAdminRestoUser.email,
          password: mockAdminRestoUser.password,
        });

        const req = {
          user: { _id: restaurant._id },
        } as unknown as Request;
        req.body = category.withSpicy;
        await createCustomMenuCategory(req);
        req.body = category.withoutSpicy;
        await createCustomMenuCategory(req);
      });
      afterEach(async () => {
        await Restaurant.deleteMany({});
        await CustomMenuCategory.deleteMany({});
        await CustomMenuCategorySpicyLevel.deleteMany({});
        await mongoose.connection.close();
      });
      // should throw error BadRequest if 'categoryId' params is missing
      it('should throw error BadRequest if \'categoryId\' params is missing', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          params: {},
        } as unknown as Request;

        await expect(() => updateCustomMenuCategory(req)).rejects.toThrow(BadRequest);
      });
      // should throw error NotFound if custom menu category with id (objectid) is not found
      it('should throw error NotFound if custom menu category with id (objectid) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const req = {
          user: { _id: restaurantId },
          params: { categoryId: '60a78c2dcf451a001c75248f' },
          body: { name: 'Kateogri baru' },
        } as unknown as Request;

        await expect(() => updateCustomMenuCategory(req)).rejects.toThrow(NotFound);
      });
      // should throw error NotFound if custom menu category with id (random string) is not found 
      it('should throw error NotFound if custom menu category with id (objectid) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const req = {
          user: { _id: restaurantId },
          params: { categoryId: 'sdfsdfsdf' },
          body: { name: 'Kategori baru'},
        } as unknown as Request;

        await expect(() => updateCustomMenuCategory(req)).rejects.toThrow(NotFound);
      });
      // should throw error Zod Error if 'name' is missing in the request body
      it('should throw error Zod Error if \'name\' is missing in the request body', async () =>{
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: categoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const req = {
          user: { _id: restaurantId },
          params: {
            categoryId,
          },
          body: {}
        } as unknown as Request;
        
        await expect(() => updateCustomMenuCategory(req)).rejects.toThrow(ZodError);
        try {
          await createCustomMenuCategory(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Required');
        }
      });
      // should throw error Zod Error if 'name' is has more than 50 chars
      it('should throw error Zod Error if \'name\' is missing has more than 50 chars', async () =>{
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: categoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const req = {
          user: { _id: restaurantId },
          params: {
            categoryId,
          },
          body: { name: 'skfjsdfgdfgyergfghfdhgdfhgdfhgbfdhbdhfgbhdfghdfghdfghdbghbgdfgb' }
        } as unknown as Request;
        
        await expect(() => updateCustomMenuCategory(req)).rejects.toThrow(ZodError);
        try {
          await createCustomMenuCategory(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
        }
      });
    });
    // success
    describe('success test', () => {
      beforeEach(async () => {
        await mongoose.connect(config.urlDb);
        const restaurant = await Restaurant.create({
          username: mockAdminRestoUser.username,
          name: mockAdminRestoUser.name,
          email: mockAdminRestoUser.email,
          password: mockAdminRestoUser.password,
        });

        const req = {
          user: { _id: restaurant._id },
        } as unknown as Request;
        req.body = category.withSpicy;
        await createCustomMenuCategory(req);
        req.body = category.withoutSpicy;
        await createCustomMenuCategory(req);
      });
      afterEach(async () => {
        await Restaurant.deleteMany({});
        await CustomMenuCategory.deleteMany({});
        await CustomMenuCategorySpicyLevel.deleteMany({});
        await mongoose.connection.close();
      });
      // should return _id (update category from no spicy level to have spicy level)
      it('should return _id (update category from no spicy level to have spicy level)', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const categorySpicyLevel = await CustomMenuCategorySpicyLevel.findOne();

        const categoryWithNoSpicy =
          await CustomMenuCategory.findOne({
            _id: { $ne: categorySpicyLevel!.customMenuCategoryId },
          });

        const updateCategoryBody: DTO.CustomMenuCategoryBody = {
          name: 'Jadi Punya Spicy Level',
          isBungkusAble: true,
          maxSpicy: 5,
        };

        const req = {
          user: { _id: restaurantId },
          params: {
            categoryId: categoryWithNoSpicy!._id,
          },
          body: updateCategoryBody,
        } as unknown as Request;

        const updatedCustomMenuCategory = await updateCustomMenuCategory(req);
        const customMenuCategorySpicyLevelExist = 
        await CustomMenuCategorySpicyLevel.findOne({ customMenuCategoryId: updatedCustomMenuCategory });

        expect(mongoose.Types.ObjectId.isValid(updatedCustomMenuCategory.toString())).toBe(true);
        expect(customMenuCategorySpicyLevelExist!.maxSpicy).toBe(updateCategoryBody.maxSpicy);
      });
      // should return _id (update category from having spicy level to have no spicy level)
      it('should return _id (update category from having spicy level to have no spicy level)', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const categorySpicyLevel = await CustomMenuCategorySpicyLevel.findOne();

        const categoryWithSpicy =
          await CustomMenuCategory.findOne({
            _id: categorySpicyLevel!.customMenuCategoryId,
          });

        const updateCategoryBody: DTO.CustomMenuCategoryBody = {
          name: 'Jadi gak punya spicy level',
          isBungkusAble: true,
        };

        const req = {
          user: { _id: restaurantId },
          params: {
            categoryId: categoryWithSpicy!._id,
          },
          body: updateCategoryBody,
        } as unknown as Request;

        const updatedCustomMenuCategory = await updateCustomMenuCategory(req);
        const customMenuCategorySpicyLevelExist = 
          await CustomMenuCategorySpicyLevel.findOne({ customMenuCategoryId: updatedCustomMenuCategory });

        expect(mongoose.Types.ObjectId.isValid(updatedCustomMenuCategory.toString())).toBe(true);
        expect(customMenuCategorySpicyLevelExist).toBeNull();
      });
    });
  });
  // test deleteCustomMenuCategory
  describe('test deleteCustomMenuCategory', () => { 
    // error
    describe('error test', () => {
      beforeEach(async () => {
        await mongoose.connect(config.urlDb);
        const restaurant = await Restaurant.create({
          username: mockAdminRestoUser.username,
          name: mockAdminRestoUser.name,
          email: mockAdminRestoUser.email,
          password: mockAdminRestoUser.password,
        });

        const req = {
          user: { _id: restaurant._id },
        } as unknown as Request;
        req.body = category.withSpicy;
        const customMenuCategory = await createCustomMenuCategory(req);

        req.body = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategory.toString(),
        }
        await createCustomMenuComposition(req);
      });
      afterEach(async () => {
        await Restaurant.deleteMany({});
        await CustomMenuComposition.deleteMany({});
        await CustomMenuCategory.deleteMany({});
        await CustomMenuCategorySpicyLevel.deleteMany({});
        await mongoose.connection.close();
      });
      // should throw error BadRequest if 'categoryId' params i missing
      it('should throw error BadRequest if \'categoryId\' params is missing', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          params: {},
        } as unknown as Request;

        await expect(() => deleteCustomMenuCategory(req)).rejects.toThrow(BadRequest);
      });
      // should throw error BadRequest if custom menu category has compositions
      it('should throw error BadRequest if custom menu category has compositions', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: categoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        
        const req = {
          user: { _id: restaurantId },
          params: { categoryId },
        } as unknown as Request;

        await expect(() => deleteCustomMenuCategory(req)).rejects.toThrow(BadRequest);
      });
      // should throw error NotFound if custom menu category with id (objectid) is not found
      it('should throw error NotFound if custom menu category with id (objectid) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        
        const req = {
          user: { _id: restaurantId },
          params: { categoryId: '60a78c2dcf451a001c75248f' },
        } as unknown as Request;

        await expect(() => deleteCustomMenuCategory(req)).rejects.toThrow(NotFound);
      });
      // should throw error NotFound if custom menu category with id (random string) is not found 
      it('should throw error NotFound if custom menu category with id (random string) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        
        const req = {
          user: { _id: restaurantId },
          params: { categoryId: 'sdfsdfsdf' },
        } as unknown as Request;

        await expect(() => deleteCustomMenuCategory(req)).rejects.toThrow(NotFound);
      });
    });
    // succcess
    describe('success test', () => {
      beforeEach(async () => {
        await mongoose.connect(config.urlDb);
        const restaurant = await Restaurant.create({
          username: mockAdminRestoUser.username,
          name: mockAdminRestoUser.name,
          email: mockAdminRestoUser.email,
          password: mockAdminRestoUser.password,
        });

        const req = {
          user: { _id: restaurant._id },
        } as unknown as Request;
        req.body = category.withSpicy;
        await createCustomMenuCategory(req);
      });
      afterEach(async () => {
        await Restaurant.deleteMany({});
        await CustomMenuComposition.deleteMany({});
        await CustomMenuCategory.deleteMany({});
        await CustomMenuCategorySpicyLevel.deleteMany({});
        await mongoose.connection.close();
      });
      // should return _id and custom menu category deleted
      it('should return _id and custom menu category deleted', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: categoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        
        const req = {
          user: { _id: restaurantId },
          params: { categoryId },
        } as unknown as Request;

        const deletedCategory = await deleteCustomMenuCategory(req);
        const findDeletedCategory = await CustomMenuCategory.findOne();
        const customMenuCategorySpicyLevel = await CustomMenuCategorySpicyLevel.findOne();
        expect(mongoose.Types.ObjectId.isValid(deletedCategory.toString())).toBe(true);
        expect(findDeletedCategory).toBeNull();
        expect(customMenuCategorySpicyLevel).toBeNull();
      });
    });
  });
});

describe('testing Custom Menu Composition Functionality', () => {
  // test getAllCustomMenuComposition
  describe('test getAllCustomMenuComposition', () => { 
    // error
    beforeEach(async () => {
      await mongoose.connect(config.urlDb);
      const restaurant = await Restaurant.create({
        username: mockAdminRestoUser.username,
        name: mockAdminRestoUser.name,
        email: mockAdminRestoUser.email,
        password: mockAdminRestoUser.password,
      });

      const req = {
        user: { _id: restaurant._id },
      } as unknown as Request;
      req.body = category.withSpicy;
      const categoryWithSpicyId = await createCustomMenuCategory(req);
      req.body = category.withoutSpicy;
      const categoryWithoutSpicyId = await createCustomMenuCategory(req);

      req.body = {
        ...composition.withSpicy.kerupukKakap,
        customMenuCategoryId: categoryWithSpicyId.toString(),
      };
      await createCustomMenuComposition(req);
      await createCustomMenuComposition(req);
      req.body = {
        ...composition.withSpicy.telurAyam,
        customMenuCategoryId: categoryWithSpicyId.toString(),
      };
      await createCustomMenuComposition(req);
      await createCustomMenuComposition(req);
      req.body = {
        ...composition.withSpicy.sosis,
        customMenuCategoryId: categoryWithSpicyId.toString(),
      };
      await createCustomMenuComposition(req);
      await createCustomMenuComposition(req);

      req.body = {
        ...composition.withoutSpicy.coklatBatangan,
        customMenuCategoryId: categoryWithoutSpicyId.toString(),
      };
      await createCustomMenuComposition(req);
      await createCustomMenuComposition(req);
      req.body = {
        ...composition.withoutSpicy.esSerut,
        customMenuCategoryId: categoryWithoutSpicyId.toString(),
      };
      await createCustomMenuComposition(req);
      await createCustomMenuComposition(req);
      req.body = {
        ...composition.withoutSpicy.susuCokelat,
        customMenuCategoryId: categoryWithoutSpicyId.toString(),
      };
      await createCustomMenuComposition(req);
      await createCustomMenuComposition(req);
    });
    afterEach(async () => {
      await Restaurant.deleteMany({});
      await CustomMenuComposition.deleteMany({});
      await CustomMenuCategory.deleteMany({});
      await CustomMenuCategorySpicyLevel.deleteMany({});
      await mongoose.connection.close();
    });
    describe('error test', () => {
      // should throw error BadRequest if list query is not number
      it('should throw error BadRequest if list query is not number', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          query: {
            limit: 'sdfsdf',
          },
        } as unknown as Request;

        await expect(() => getAllCustomMenuComposition(req)).rejects.toThrow(BadRequest);
      });
      // should throw error BadRequest if page query is not number
      it('should throw error BadRequest if page query is not number', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          query: {
            page: 'sdfsdf',
          },
        } as unknown as Request;

        await expect(() => getAllCustomMenuComposition(req)).rejects.toThrow(BadRequest);
      });
      // should throw error BadRequest if page query is bigger than total pages
      it('should throw error BadRequest if page query is bigger than total pages', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          query: {
            limit: '10',
            page: '3',
          },
        } as unknown as Request;

        await expect(() => getAllCustomMenuComposition(req)).rejects.toThrow(BadRequest);
      });
    });

    // success
    describe('success test)', () => { 
      // should return GetCustomMenuCompositionsWithPaginated with exist data
      it('should return GetCustomMenuCompositionsWithPaginated with exist data', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          query: {},
        } as unknown as Request;

        const compositions = await getAllCustomMenuComposition(req) as DTO.GetCustomMenuCompositionsWithPaginated;
        expect(compositions.customMenuCompositions).toHaveLength(10);
        expect(compositions.pages).toBe(2);
        expect(compositions.total).toBe(12);
      });
      // should return GetCustomMenuCompositionsWithPaginated with limit query
      it('should return GetCustomMenuCompositionsWithPaginated with limit', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          query: {
            limit: '5'
          },
        } as unknown as Request;
        
        const compositions = await getAllCustomMenuComposition(req) as DTO.GetCustomMenuCompositionsWithPaginated;
        expect(compositions.customMenuCompositions).toHaveLength(5);
        expect(compositions.pages).toBe(3);
        expect(compositions.total).toBe(12);
      });
      // should return GetCustomMenuCompositionsWithPaginated with limit and page query
      it('should return GetCustomMenuCompositionsWithPaginated with limit and page query', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          query: {
            limit: '5',
            page: '3',
          },
        } as unknown as Request;
        
        const compositions = await getAllCustomMenuComposition(req) as DTO.GetCustomMenuCompositionsWithPaginated;
        expect(compositions.customMenuCompositions).toHaveLength(2);
        expect(compositions.pages).toBe(3);
        expect(compositions.total).toBe(12);
      });
      // should return GetCustomMenuCompositionsWithPaginated with limit and page query and name
      it('should return GetCustomMenuCompositionsWithPaginated with limit and page query and name', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          query: {
            limit: '5',
            page: '1',
            name: 'kerupuk',
          },
        } as unknown as Request;

        const compositions = await getAllCustomMenuComposition(req) as DTO.GetCustomMenuCompositionsWithPaginated;
        expect(compositions.customMenuCompositions).toHaveLength(2);
        expect(compositions.customMenuCompositions[0].name).toBe(composition.withSpicy.kerupukKakap.name);
        expect(compositions.pages).toBe(1);
        expect(compositions.total).toBe(2);
      });
      // should return GetCustomMenuCompositionsWithPaginated with empty array
      it('should return GetCustomMenuCompositionsWithPaginated with empty array', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        await CustomMenuComposition.deleteMany({});
        const req = {
          user: { _id: restaurantId },
          query: {},
        } as unknown as Request;

        const compositions = await getAllCustomMenuComposition(req) as DTO.GetCustomMenuCompositionsWithPaginated;
        expect(compositions.customMenuCompositions).toHaveLength(0);
      });
    });
  });
  // test createCustomMenuComposition
  describe('test createCustomMenuComposition', () => {
    beforeEach(async () => {
      await mongoose.connect(config.urlDb);
      const restaurant = await Restaurant.create({
        username: mockAdminRestoUser.username,
        name: mockAdminRestoUser.name,
        email: mockAdminRestoUser.email,
        password: mockAdminRestoUser.password,
      });

      const req = {
        user: { _id: restaurant._id },
      } as unknown as Request;
      req.body = category.withSpicy;
      await createCustomMenuCategory(req);
      req.body = category.withoutSpicy;
      await createCustomMenuCategory(req);
    });
    afterEach(async () => {
      await Restaurant.deleteMany({});
      await CustomMenuComposition.deleteMany({});
      await CustomMenuCategory.deleteMany({});
      await CustomMenuCategorySpicyLevel.deleteMany({});
      await mongoose.connection.close();
    });
    // error
    describe('error test', () => { 
      // should throw ZodError if 'name' is missing
      it('should throw ZodError if \'name\' is missing', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: undefined,
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Required');
        }
      });
      // should throw ZodError if 'name' is not string
      it('should throw ZodError if \'name\' is not string', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 9,
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Expected string, received number');
        }
      });
      // should throw ZodError if 'name' has empty string
      it('should throw ZodError if \'name\' has empty string', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: '',
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('String must contain at least 1 character(s)');
        }
      });
      // should throw ZodError if 'name' has more than 80 chars
      it('should throw ZodError if \'name\' has more than 80 chars', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'sdfjdkfjfjksdjfksdfksdfjksdjfkdjfksdjfkjsdkfjkdsjfsdfdsfsdfskdfjksjdfksdjfjsdkfjskdf',
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('String must contain at most 80 character(s)');
        }
      });
      // should throw ZodError if 'description' is missing
      it('should throw ZodError if \'description\' is missing', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          description: undefined,
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('description');
          expect(error.errors[0].message).toBe('Required');
        }
      });
      // should throw ZodError if 'description' is not string
      it('should throw ZodError if \'description\' is not string', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          description: 545454,
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('description');
          expect(error.errors[0].message).toBe('Expected string, received number');
        }
      });
      // should throw ZodError if 'description' has empty string
      it('should throw ZodError if \'description\' has empty string', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          description: '',
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('description');
          expect(error.errors[0].message).toBe('String must contain at least 1 character(s)');
        }
      });
      // should throw ZodError if 'description' has more than 3000 chars
      it('should throw ZodError if \'description\' has more than 3000 chars', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          description: moreThan3000chars,
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('description');
          expect(error.errors[0].message).toBe('String must contain at most 3000 character(s)');
        }
      });
      // should throw ZodError if 'price' is missing
      it('should throw ZodError if \'price\' is missing', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          price: undefined,
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('price');
          expect(error.errors[0].message).toBe('Required');
        }
      });
      // should throw ZodError if 'price' is not number
      it('should throw ZodError if \'price\' is not number', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          price: 'dfdfdfdfdf',
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('price');
          expect(error.errors[0].message).toBe('Expected number, received string');
        }
      });
      // should throw ZodError if 'price' is not positive
      it('should throw ZodError if \'price\' is not positive', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          price: -1,
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('price');
          expect(error.errors[0].message).toBe('Number must be greater than 0');
        }
      });
      // should throw ZodError if 'images' is missing
      it('should throw ZodError if \'images\' is missing', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          images: undefined,
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('images');
          expect(error.errors[0].message).toBe('Required');
        }
      });
      // should throw ZodError if 'images' is not array
      it('should throw ZodError if \'images\' is not array', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          images: 9090,
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('images');
          expect(error.errors[0].message).toBe('Expected array, received number');
        }
      });
      // should throw ZodError if 'images' is not array of string
      it('should throw ZodError if \'images\' is not array of string', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          images: [0],
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('images');
          expect(error.errors[0].message).toBe('Expected string, received number');
        }
      });
      // should throw ZodError if 'images' is empty array
      it('should throw ZodError if \'images\' is empty array', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          images: [],
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('images');
          expect(error.errors[0].message).toBe('Array must contain at least 1 element(s)');
        }
      });
      // should throw ZodError if 'images' has more length more than 2
      it('should throw ZodError if \'images\' has more length more than 2', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          images: [
            'imagelink1',
            'imagelink2',
            'imagelink3',
          ],
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('images');
          expect(error.errors[0].message).toBe('Array must contain at most 2 element(s)');
        }
      });
      // should throw ZodError if 'stock' is not number
      it('should throw ZodError if \'stock\' is not number', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
          stock: 'dfdfdfdfdf',
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('stock');
          expect(error.errors[0].message).toBe('Expected number, received string');
        }
      });
      // should throw error NotFound if custom menu category with id (objectid) is not found
      it('should throw error NotFound if custom menu category with id (objectid) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: '5f5632b80e5a8c4eabd8e46f',
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(NotFound);
      });
      // should throw error NotFound if custom menu category with id (random string) is not found
      it('should throw error NotFound if custom menu category with id (random string) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: 'dfs56fgfdfgdgdfg',
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(NotFound);
      });
    });
    // success
    describe('success test', () => { 
      // should return _id of create custom menu composition
      it('should return _id of create custom menu composition', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.kerupukKakap,
          customMenuCategoryId: customMenuCategoryId.toString(),
        };
        req.body = payloadBody;

        const createdCustomMenuComposition = await createCustomMenuComposition(req);
        expect(mongoose.Types.ObjectId.isValid(createdCustomMenuComposition.toString())).toBe(true);
      });
    });
  });
  // test getSpecificCustomMenuComposition
  describe('test getSpecificCustomMenuComposition', () => {
    beforeEach(async () => {
      await mongoose.connect(config.urlDb);
      const restaurant = await Restaurant.create({
        username: mockAdminRestoUser.username,
        name: mockAdminRestoUser.name,
        email: mockAdminRestoUser.email,
        password: mockAdminRestoUser.password,
      });

      const req = {
        user: { _id: restaurant._id },
      } as unknown as Request;
      req.body = category.withSpicy;
      const categoryWithSpicyId = await createCustomMenuCategory(req);

      req.body = {
        ...composition.withSpicy.kerupukKakap,
        customMenuCategoryId: categoryWithSpicyId.toString(),
      };
      await createCustomMenuComposition(req);
    });
    afterEach(async () => {
      await Restaurant.deleteMany({});
      await CustomMenuComposition.deleteMany({});
      await CustomMenuCategory.deleteMany({});
      await CustomMenuCategorySpicyLevel.deleteMany({});
      await mongoose.connection.close();
    });
    // error
    describe('error test', () => { 
      // should throw error NotFound if custom menu category with id (objectid) is not found
      it('should throw error NotFound if custom menu category with id (objectId) is not found ', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const req = {
          user: { _id: restaurantId },
          params: {
            compositionId: '5f5632b80e5a8c4eabd8e46f',
          }
        } as unknown as Request;

        await expect(() => getSpecificCustomMenuComposition(req)).rejects.toThrow(NotFound);
      });
      // should throw error NotFound if custom menu category with id (random string) is not found
      it('should throw error NotFound if custom menu category with id (random string) is not found ', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const req = {
          user: { _id: restaurantId },
          params: {
            compositionId: 'dfsdfwrte3rt',
          }
        } as unknown as Request;

        await expect(() => getSpecificCustomMenuComposition(req)).rejects.toThrow(NotFound);
      });
    });
    // success
    describe('success', () => {
      // should return data with CustomMenuCompositionResponseDTO
      it('should return data with CustomMenuCompositionResponseDTO', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;
        const req = {
          user: { _id: restaurantId },
          params: {
            compositionId: compositionId.toString(),
          }
        } as unknown as Request;

        const customMenuComposition =
          await getSpecificCustomMenuComposition(req) as DTO.CustomMenuCompositionResponse;
        expect(customMenuComposition).toHaveProperty('_id');
        expect(customMenuComposition).toHaveProperty('name');
        expect(customMenuComposition).toHaveProperty('images');
        expect(customMenuComposition).toHaveProperty('description');
        expect(customMenuComposition).toHaveProperty('price');
        expect(customMenuComposition).toHaveProperty('stock');
        expect(customMenuComposition).toHaveProperty('customMenuCategoryId');
        expect(customMenuComposition.name).toBe(composition.withSpicy.kerupukKakap.name);
      });
    });
  });
  // test updateCustomMenuComposition
  describe('test updateCustomMenuComposition', () => {
    beforeEach(async () => {
      await mongoose.connect(config.urlDb);
      const restaurant = await Restaurant.create({
        username: mockAdminRestoUser.username,
        name: mockAdminRestoUser.name,
        email: mockAdminRestoUser.email,
        password: mockAdminRestoUser.password,
      });

      const req = {
        user: { _id: restaurant._id },
      } as unknown as Request;
      req.body = category.withSpicy;
      const categoryWithSpicyId = await createCustomMenuCategory(req);

      req.body = {
        ...composition.withSpicy.kerupukKakap,
        customMenuCategoryId: categoryWithSpicyId.toString(),
      };
      await createCustomMenuComposition(req);
    });
    afterEach(async () => {
      await Restaurant.deleteMany({});
      await CustomMenuComposition.deleteMany({});
      await CustomMenuCategory.deleteMany({});
      await CustomMenuCategorySpicyLevel.deleteMany({});
      await mongoose.connection.close();
    });
    // error
    describe('error test', () => {
      // should throw BadRequest if compositionId param is missing
      it('should throw BadRequest if compositionId param is missing', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const req = {
          user: { _id: restaurantId },
          params: {},
          body: {},
        } as unknown as Request;

        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(BadRequest);
      });
      // should throw ZodError if 'name' is missing
      it('should throw ZodError if \'name\' is missing', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: undefined,
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await updateCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Required');
        }
      });
      // should throw ZodError if 'name' is not string
      it('should throw ZodError if \'name\' is not string', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 0,
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await updateCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('Expected string, received number');
        }
      });
      // should throw ZodError if 'name' has empty string
      it('should throw ZodError if \'name\' has empty string', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: '',
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await updateCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('String must contain at least 1 character(s)');
        }
      });
      // should throw ZodError if 'name' has more than 80 chars
      it('should throw ZodError if \'name\' has more than 80 chars', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          name: 'sdfjdkfjfjksdjfksdfksdfjksdjfkdjfksdjfkjsdkfjkdsjfsdfdsfsdfskdfjksjdfksdjfjsdkfjskdf',
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await updateCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('name');
          expect(error.errors[0].message).toBe('String must contain at most 80 character(s)');
        }
      });
      // should throw ZodError if 'description' is missing
      it('should throw ZodError if \'description\' is missing', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          description: undefined,
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await updateCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('description');
          expect(error.errors[0].message).toBe('Required');
        }
      });
      // should throw ZodError if 'description' is not string
      it('should throw ZodError if \'name\' is not string', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          description: 0,
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await updateCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('description');
          expect(error.errors[0].message).toBe('Expected string, received number');
        }
      });
      // should throw ZodError if 'description' has empty string
      it('should throw ZodError if \'description\' has empty string', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          description: '',
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await updateCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('description');
          expect(error.errors[0].message).toBe('String must contain at least 1 character(s)');
        }
      });
      // should throw ZodError if 'description' has more than 3000 chars
      it('should throw ZodError if \'description\' has more than 3000 chars', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          description: moreThan3000chars,
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await updateCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('description');
          expect(error.errors[0].message).toBe('String must contain at most 3000 character(s)');
        }
      });
      // should throw ZodError if 'price' is missing
      it('should throw ZodError if \'price\' is missing', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          price: undefined,
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await updateCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('price');
          expect(error.errors[0].message).toBe('Required');
        }
      });
      // should throw ZodError if 'price' is not number
      it('should throw ZodError if \'price\' is not number', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          price: 'dfdfdfdf',
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await updateCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('price');
          expect(error.errors[0].message).toBe('Expected number, received string');
        }
      });
      // should throw ZodError if 'price' is not positive
      it('should throw ZodError if \'price\' is not positive', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          price: -1,
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await updateCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('price');
          expect(error.errors[0].message).toBe('Number must be greater than 0');
        }
      });
      // should throw ZodError if 'images' is missing
      it('should throw ZodError if \'images\' is missing', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          images: undefined,
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('images');
          expect(error.errors[0].message).toBe('Required');
        }
      });
      // should throw ZodError if 'images' is not array
      it('should throw ZodError if \'images\' is not array', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          images: 8,
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('images');
          expect(error.errors[0].message).toBe('Expected array, received number');
        }
      });
      // should throw ZodError if 'images' is not array of string
      it('should throw ZodError if \'images\' is not array of string', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          images: [0],
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('images');
          expect(error.errors[0].message).toBe('Expected string, received number');
        }
      });
      // should throw ZodError if 'images' is empty array
      it('should throw ZodError if \'images\' is not  empty array', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          images: [],
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('images');
          expect(error.errors[0].message).toBe('Array must contain at least 1 element(s)');
        }
      });
      // should throw ZodError if 'images' has more length more than 2
      it('should throw ZodError if \'images\' has more length more than 2', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          images: [
            'imagelink1',
            'imagelink2',
            'imagelink3',
          ],
        };
        req.body = payloadBody;
        await expect(() => createCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await createCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('images');
          expect(error.errors[0].message).toBe('Array must contain at most 2 element(s)');
        }
      });
      // should throw ZodError if 'stock' is not number
      it('should throw ZodError if \'stock\' is not number', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;


        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
          stock: 'dfdfdfdfdf',
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(ZodError);

        try {
          await updateCustomMenuComposition(req);
        } catch (error: any) {
          expect(error).toBeInstanceOf(ZodError);
          expect(error.errors[0].path[0]).toBe('stock');
          expect(error.errors[0].message).toBe('Expected number, received string');
        }
      });
      // should throw error NotFound if custom menu category with id (objectid) is not found
      it('should throw error NotFound if custom menu category with id (objectid) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: '5f5632b80e5a8c4eabd8e46f',
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(NotFound);
      });
      // should throw error NotFound if custom menu category with id (random string) is not found
      it('should throw error NotFound if custom menu category with id (random string) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { compositionId },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: '5f5632b80e5a8c4eabd8e46f',
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(NotFound);
      });
      // should throw error NotFound if custom menu composition with id (objectid) is not found
      it('should throw error NotFound if custom menu composition with id (objectid) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: categoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          params: {
            compositionId: '5f5632b80e5a8c4eabd8e46f',
          },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: categoryId.toString(),
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(NotFound);
      });
      // should throw error NotFound if custom menu composition with id (random string) is not found
      it('should throw error NotFound if custom menu composition with id (random string) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: categoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;

        const req = {
          user: { _id: restaurantId },
          params: {
            compositionId: 'fgfgf',
          },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: categoryId.toString(),
        };
        req.body = payloadBody;
        await expect(() => updateCustomMenuComposition(req)).rejects.toThrow(NotFound);
      });
    });
    // success
    describe('success', () => { 
      // should return _id of updated composition
      it('should throw error NotFound if custom menu category with id (objectid) is not found', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: customMenuCategoryId } = await CustomMenuCategory.findOne() as ICustomMenuCategory;
        const notUpdatedComposition = await CustomMenuComposition.findOne() as ICustomMenuComposition;

        const req = {
          user: { _id: restaurantId },
          params: { 
            compositionId: notUpdatedComposition._id,
          },
          body: {},
        } as unknown as Request;

        const payloadBody = {
          ...composition.withSpicy.telurAyam,
          customMenuCategoryId: customMenuCategoryId.toString(),
        };

        req.body = payloadBody;
        const updatedCompositionId = await updateCustomMenuComposition(req);

        const updatedComposition = await CustomMenuComposition.findById(updatedCompositionId);

        expect(notUpdatedComposition.name).toBe(composition.withSpicy.kerupukKakap.name);
        expect(updatedComposition!.name).toBe(composition.withSpicy.telurAyam.name);
      });
    });
  })
  // test deleteCustomMenuComposition
  describe('test deleteCustomMenuComposition', () => {
    beforeEach(async () => {
      await mongoose.connect(config.urlDb);
      const restaurant = await Restaurant.create({
        username: mockAdminRestoUser.username,
        name: mockAdminRestoUser.name,
        email: mockAdminRestoUser.email,
        password: mockAdminRestoUser.password,
      });

      const req = {
        user: { _id: restaurant._id },
      } as unknown as Request;
      req.body = category.withSpicy;
      const categoryWithSpicyId = await createCustomMenuCategory(req);

      req.body = {
        ...composition.withSpicy.kerupukKakap,
        customMenuCategoryId: categoryWithSpicyId.toString(),
      };
      await createCustomMenuComposition(req);
    });
    afterEach(async () => {
      await Restaurant.deleteMany({});
      await CustomMenuComposition.deleteMany({});
      await CustomMenuCategory.deleteMany({});
      await CustomMenuCategorySpicyLevel.deleteMany({});
      await mongoose.connection.close();
    });
    // error
    describe('error', () => { 
      // should throw error NotFound if custom menu composition with id (objectid) is not found
      it('should throw error NotFound if custom menu composition with id (objectId) is not found ', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const req = {
          user: { _id: restaurantId },
          params: {
            compositionId: '5f5632b80e5a8c4eabd8e46f',
          }
        } as unknown as Request;

        await expect(() => deleteCustomMenuComposition(req)).rejects.toThrow(NotFound);
      });
      // should throw error NotFound if custom menu category with id (random string) is not found
      it('should throw error NotFound if custom menu composition with id (random string) is not found ', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const req = {
          user: { _id: restaurantId },
          params: {
            compositionId: 'ssd',
          }
        } as unknown as Request;

        await expect(() => deleteCustomMenuComposition(req)).rejects.toThrow(NotFound);
      });
    });
    // success
    describe('success test', () => { 
      // should return _id of deleted custom menu composition
      it('should return _id of deleted custom menu composition', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const { _id: compositionId } = await CustomMenuComposition.findOne() as ICustomMenuComposition;
        
        const req = {
          user: { _id: restaurantId },
          params: {
            compositionId,
          }
        } as unknown as Request;

        const deletedCustomMenuComposition = await deleteCustomMenuComposition(req);
        const findComposition = await CustomMenuComposition.findById(deletedCustomMenuComposition);
        expect(mongoose.Types.ObjectId.isValid(deletedCustomMenuComposition.toString())).toBe(true);
        expect(findComposition).toBeNull();
      });
    });
  });
});

import mongoose, { IsItRecordAndNotAny, mongo } from 'mongoose';
import config from '../../../../../src/config';
import Restaurant, { IRestaurant } from '../../../../../src/models/Restaurant';
import CustomMenuCategory, { ICustomMenuCategory } from '../../../../../src/models/CustomMenuCategory';
import {
  CustomMenuCategoryBodyDTO,
  CustomMenuCategoryResponseDTO,
  CustomMenuCompositionBodyDTO,
  createCustomMenuCategory,
  createCustomMenuComposition,
  deleteCustomMenuCategory,
  getAllCustomMenuCategory,
  getSpecificCustomMenuCategory,
  updateCustomMenuCategory
} from '../../../../../src/services/mongoose/resto/custom-menu';
import * as composition from '../../../../mock/customMenuComposition';
import * as category from '../../../../mock/customMenuCategory';
import mockAdminRestoUser from '../../../../mock/adminResto';
import { Request } from 'express';
import CustomMenuCategorySpicyLevel from '../../../../../src/models/CustomMenuCategorySpicyLevel';
import { ZodError, custom } from 'zod';
import { BadRequest, NotFound } from '../../../../../src/errors';
import CustomMenuComposition from '../../../../../src/models/CustomMenuComposition';

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
      // should return array of CustomMenuCategoryResponseDTO with id and name
      it('should return array of CustomMenuCategoryResponseDTO with id and name', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
        const req = {
          user: { _id: restaurantId },
        } as unknown as Request;
        const customMenuCategories =
          await getAllCustomMenuCategory(req) as Pick<CustomMenuCategoryResponseDTO, "name" | "_id">[];

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
      // should return CustomMenuCategoryResponseDTO with maxSpicy has value
      it('should return CustomMenuCategoryResponseDTO with maxSpicy has value', async () => {
        const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

        const findCustomMenuCategorySpicyLevel = await CustomMenuCategorySpicyLevel.findOne();
        const req = {
          user: { _id: restaurantId },
          params: {
            categoryId: findCustomMenuCategorySpicyLevel!.customMenuCategoryId }
        } as unknown as Request;
        const customMenuCategory = 
          await getSpecificCustomMenuCategory(req) as CustomMenuCategoryResponseDTO;

        // behaviour
        expect(customMenuCategory).toHaveProperty('_id');
        expect(customMenuCategory).toHaveProperty('name');
        expect(customMenuCategory).toHaveProperty('isBungkusAble');
        expect(customMenuCategory).toHaveProperty('maxSpicy');
        expect(customMenuCategory.maxSpicy)
          .toBe(findCustomMenuCategorySpicyLevel!.maxSpicy);
      });
      // should return CustomMenuCategoryResponseDTO with maxSpicy is null
      it('should return CustomMenuCategoryResponseDTO with maxSpicy is null', async () => {
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
          await getSpecificCustomMenuCategory(req) as CustomMenuCategoryResponseDTO;

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

        const updateCategoryBody: CustomMenuCategoryBodyDTO = {
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

        const updateCategoryBody: CustomMenuCategoryBodyDTO = {
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
        expect(mongoose.Types.ObjectId.isValid(deletedCategory.toString())).toBe(true);
        expect(findDeletedCategory).toBeNull();
      });
    });
  });
});

describe('testing Custom Menu Composition Functionality', () => {
  // test getAllCustomMenuComposition
  describe('test getAllCustomMenuComposition', () => { 
    // error
    describe('error test', () =>{
      // should throw error BadRequest if list or page query is not number
    });

    // success
    describe('success test)', () => { 
      // shoudl return GetCustomMenuCompositionsWithPaginated with exist data
      // shoudl return GetCustomMenuCompositionsWithPaginated with empty array
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

        const payloadBody = composition.withSpicy;
      });
      // should throw ZodError if 'name' is not string
      // should throw ZodError if 'name' has empty string
      // should throw ZodError if 'name' has more than 80 chars
      // should throw ZodError if 'description' is missing
      // should throw ZodError if 'description' is not string
      // should throw ZodError if 'description' has empty string
      // should throw ZodError if 'description' has more than 3000 chars
      // should throw ZodError if 'price' is missing
      // should throw ZodError if 'price' is not number
      // should throw ZodError if 'price' is not positive
      // should throw ZodError if 'images' is missing
      // should throw ZodError if 'images' is not array
      // should throw ZodError if 'images' is not array of string
      // should throw ZodError if 'images' is empty array
      // should throw ZodError if 'images' has more length more than 5
      // should throw ZodError if 'stock' is not number
      // should throw error NotFound if custom menu category with id (objectid) is not found
      // should throw error NotFound if custom menu category with id (random string) is not found
    });
    // success
    describe('success test', () => { 
      // should return _id of create custom menu composition
    });
  });
  // test getSpecificCustomMenuComposition
  describe('test getSpecificCustomMenuComposition', () => { 
    // error
    describe('error test', () => { 
      // should throw error NotFound if custom menu category with id (objectid) is not found 
      // should throw error NotFound if custom menu category with id (random string) is not found 
    })
    // success
    describe('success', () => {
      // should return data with CustomMenuCompositionResponseDTO
    });
  });
  // test updateCustomMenuComposition
  describe('test updateCustomMenuComposition', () => { 
    // error
    describe('error test', () => {
      // should throw BadRequest if compositionId param is missing
      // should throw ZodError if 'name' is missing
      // should throw ZodError if 'name' is not string
      // should throw ZodError if 'name' has empty string
      // should throw ZodError if 'name' has more than 80 chars
      // should throw ZodError if 'description' is missing
      // should throw ZodError if 'description' is not string
      // should throw ZodError if 'description' has empty string
      // should throw ZodError if 'description' has more than 3000 chars
      // should throw ZodError if 'price' is missing
      // should throw ZodError if 'price' is not number
      // should throw ZodError if 'price' is not positive
      // should throw ZodError if 'images' is missing
      // should throw ZodError if 'images' is not array
      // should throw ZodError if 'images' is not array of string
      // should throw ZodError if 'images' is empty array
      // should throw ZodError if 'images' has more length more than 5
      // should throw ZodError if 'stock' is not number
      // should throw error NotFound if custom menu composition with id (objectid) is not found
      // should throw error NotFound if custom menu composition with id (random string) is not found
    });

    // success
    describe('success', () => { 
      // should return _id of updated composition
    });
  })
  // test deleteCustomMenuComposition
  describe('test deleteCustomMenuComposition', () => { 
    // error
    describe('error', () => { 
      // should throw error NotFound if custom menu category with id (objectid) is not found
      // should throw error NotFound if custom menu category with id (random string) is not found
    });
    // success
    describe('success test', () => { 
      // should return _id of deleted custom menu composition
    });
  });
});

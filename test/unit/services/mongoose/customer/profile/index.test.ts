import mongoose, { mongo } from 'mongoose';
import { Request } from 'express';

import config from '../../../../../../src/config';
import Customer, { ICustomer } from '../../../../../../src/models/Customer';
import { customerSignup as mockCustomer } from '../../../../../mock/customer';
import { signupForm } from '../../../../../../src/services/mongoose/customer/auth';
import * as profileService from '../../../../../../src/services/mongoose/customer/profile';
import * as DTO from '../../../../../../src/services/mongoose/customer/profile/types';
import { ZodError } from 'zod';
import CustomerVerification from '../../../../../../src/models/CustomerVerification';

describe('testing customer profile service', () => {
  beforeAll(async () => {
    await mongoose.connect(config.urlDb);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  }, 3000);

  beforeEach(async () => {
    const req = {
      body: { ...mockCustomer }
    } as unknown as Request;

    await signupForm(req);
  });

  afterEach(async () => {
    await Customer.deleteMany({});
    await CustomerVerification.deleteMany({});
  });

  // test getCustomerProfile
  describe('test getCustomerProfile', () => {
    // error

    // success
    // should return result of CustomerProfileResponse
    it('should return result of CustomerProfileResponse', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;

      const req = {
        user: { _id: customerId },
      } as unknown as Request;

      const customerProfile =
        await profileService.getCustomerProfile(req) as DTO.CustomerProfileResponse;

      expect(customerProfile).toHaveProperty('_id');
      expect(customerProfile.avatar).toBe('customer-avatar.jpg');
      expect(customerProfile.name).toBe(mockCustomer.name);
      expect(customerProfile.username).toBe(mockCustomer.username);
    });
  });
  // test updateCustomerProfile
  describe('test updateCustomerProfile', () => { 
    // error
    // should throw error ZodError if 'avatar' is not string
    it('should throw error ZodError if \'avatar\' is not string', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
      } as unknown as Request;
      req.body = {
        avatar: 0,
      }

      await expect(() => profileService.updateCustomerProfile(req)).rejects.toThrow(ZodError);

      try {
        await profileService.updateCustomerProfile(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('avatar');
        expect(error.errors[0].message).toBe('Avatar harus diisi dengan url gambar avatar.');
      }
    });
    // should throw error ZodError if 'avatar' is not url
    it('should throw error ZodError if \'avatar\' is not url', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
      } as unknown as Request;
      req.body = {
        avatar: 'sdfsdfsdfsdfsdf',
      }

      await expect(() => profileService.updateCustomerProfile(req)).rejects.toThrow(ZodError);

      try {
        await profileService.updateCustomerProfile(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('avatar');
        expect(error.errors[0].message).toBe('Avatar harus diisi dengan url gambar avatar.');
      }
    });
    // should throw error ZodError if \'username\' is not string
    it('should throw error ZodError if \'username\' is not string', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
      } as unknown as Request;
      req.body = {
        username: 0,
      }

      await expect(() => profileService.updateCustomerProfile(req)).rejects.toThrow(ZodError);

      try {
        await profileService.updateCustomerProfile(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('username');
        expect(error.errors[0].message).toBe('Username harus berupa string.');
      }
    });
    // should throw error ZodError if \'username\' is not valid due regex
    it('should throw error ZodError if \'username\' is not valid due regex', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
      } as unknown as Request;
      req.body = {
        username: 'Ddfdf',
      }

      await expect(() => profileService.updateCustomerProfile(req)).rejects.toThrow(ZodError);

      try {
        await profileService.updateCustomerProfile(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('username');
        expect(error.errors[0].message).toBe('Silakan gunakan karakter a-z 0-9 . _ \'');
      }
    });
    // should throw error ZodError if \'username\' has less than 3 chars
    it('should throw error ZodError if \'username\' has less than 3 chars', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
      } as unknown as Request;
      req.body = {
        username: 'df',
      }

      await expect(() => profileService.updateCustomerProfile(req)).rejects.toThrow(ZodError);

      try {
        await profileService.updateCustomerProfile(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('username');
        expect(error.errors[0].message).toBe('Username minimal memiliki 3 karakter.');
      }
    });
    // should throw error ZodError if \'username\' has more than 30 chars
    it('should throw error ZodError if \'username\' has more than 30 chars', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
      } as unknown as Request;
      req.body = {
        username: 'fgsdfgsdfgkfdjkgsjkdfgjkdfhgjkdfhjkgndfjkvndjfnjdfngjfgsdfhjksdfjksdfjhxcvxcvxcvxcvxcvxcvxcsdfsdfsdf',
      }

      await expect(() => profileService.updateCustomerProfile(req)).rejects.toThrow(ZodError);

      try {
        await profileService.updateCustomerProfile(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('username');
        expect(error.errors[0].message).toBe('Username maksimal memiliki 30 karakter.');
      }
    });
    // should throw error ZodError if \'name\' is not string
    it('should throw error ZodError if \'name\' is not string', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
      } as unknown as Request;
      req.body = {
        name: 0,
      }

      await expect(() => profileService.updateCustomerProfile(req)).rejects.toThrow(ZodError);

      try {
        await profileService.updateCustomerProfile(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('name');
        expect(error.errors[0].message).toBe('Nama harus berupa string.');
      }
    });
    // should throw error ZodError if \'name\' is not valid due regex
    it('should throw error ZodError if \'name\' is not valid due regex', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
      } as unknown as Request;
      req.body = {
        name: 'Hiday><',
      }

      await expect(() => profileService.updateCustomerProfile(req)).rejects.toThrow(ZodError);

      try {
        await profileService.updateCustomerProfile(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('name');
        expect(error.errors[0].message).toBe('Silakan gunakan karakter a-z A-Z 0-9 . , _ -');
      }
    });
    // should throw error ZodError if \'name\' has less than 3 chars
    it('should throw error ZodError if \'name\' has less than 3 chars', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
      } as unknown as Request;
      req.body = {
        name: 'Hi',
      }

      await expect(() => profileService.updateCustomerProfile(req)).rejects.toThrow(ZodError);

      try {
        await profileService.updateCustomerProfile(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('name');
        expect(error.errors[0].message).toBe('Nama minimal memiliki 3 karakter.');
      }
    }); 
    // should throw error ZodError if \'name\' has more than 50 chars
    it('should throw error ZodError if \'name\' has more than 50 chars', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
      } as unknown as Request;
      req.body = {
        name: 'fgsdfgsdfgkfdjkgsjkdfgjkdfhgjkdfhjkgndfjkvndjfnjdfngjfgsdfhjksdfjksdfjhxcvxcvxcvxcvxcvxcvxcsdfsdfsdf',
      }

      await expect(() => profileService.updateCustomerProfile(req)).rejects.toThrow(ZodError);

      try {
        await profileService.updateCustomerProfile(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('name');
        expect(error.errors[0].message).toBe('Nama maksimal memiliki 50 karakter.');
      }
    });

    // success
    // should return result of updated customer _id
    it('should return result of updated customer _id', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
      } as unknown as Request;
      req.body = {
        name: 'Adi Muhamad Firmansyah',
        username: 'firmansyah__',
        avatar: 'https://image.com/imageexample',
      }
      const updatedCustomerProfileId =
        await profileService.updateCustomerProfile(req) as DTO.CustomerProfileResponse['_id'];
      const updatedCustomerProfile = await Customer.findById(updatedCustomerProfileId);

      expect(mongoose.Types.ObjectId.isValid(updatedCustomerProfileId.toString())).toBe(true);
      expect(updatedCustomerProfile!.name).toBe('Adi Muhamad Firmansyah');
      expect(updatedCustomerProfile!.username).toBe('firmansyah__');
      expect(updatedCustomerProfile!.avatar).toBe('https://image.com/imageexample');
      
    });
  });
  // test updateCustomerJoinBotramMethod
  describe('test updateCustomerJoinBotramMethod', () => { 
    // error
    // should throw error ZodError if \'joinBotram\' is missing
    it('should throw error ZodError if \'joinBotram\' is missing', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
        body: {},
      } as unknown as Request;

      await expect(() => profileService.updateCustomerJoinBotramMethod(req))
        .rejects.toThrow(ZodError);

      try {
        await profileService.updateCustomerProfile(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('joinBotram');
        expect(error.errors[0].message).toBe('Status joinBotram harus diisi.');
      }
    });
    // should throw error ZodError if \'joinBotram\' has no valid status
    it('should throw error ZodError if \'joinBotram\' has no valid status', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
        body: {
          joinBotram: 'byslef',
        },
      } as unknown as Request;

      await expect(() => profileService.updateCustomerJoinBotramMethod(req))
        .rejects.toThrow(ZodError);

      try {
        await profileService.updateCustomerProfile(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('joinBotram');
        expect(error.errors[0].message).toBe('Status valid antara \'directly\', \'invitation\', \'byself\'');
      }
    });
    
    // success
    // should return result of updated customer _id
    it('should return result of updated customer _id', async () => {
      const { _id: customerId } = await Customer.findOne() as ICustomer;
      
      const req = {
        user: { _id: customerId },
        body: {
          joinBotram: 'directly',
        },
      } as unknown as Request;

      const updatedJoinBotramCustomerId =
        await profileService.updateCustomerJoinBotramMethod(req) as DTO.CustomerProfileResponse['_id'];

      const updatedJoinBotramCustomer =
        await Customer.findById(updatedJoinBotramCustomerId);

      expect(mongoose.Types.ObjectId.isValid(updatedJoinBotramCustomerId.toString())).toBe(true);
      expect(updatedJoinBotramCustomer!.joinBotram).toBe('directly');
    });
  });
});
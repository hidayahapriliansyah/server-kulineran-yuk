import { Request } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { customerSignup as mockCustomer } from '../../../../../mock/customer';
import * as authService from '../../../../../../src/services/mongoose/customer/auth';
import Customer, { ICustomer } from '../../../../../../src/models/Customer';
import CustomerVerification from '../../../../../../src/models/CustomerVerification';
import config from '../../../../../../src/config';
import { BadRequest, Unauthorized } from '../../../../../../src/errors';

// test signupForm
describe('test singupForm', () => {
  beforeAll(async () => {
    await mongoose.connect(config.urlDb);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  }, 3000);
  
  afterEach(async () => {
    await Customer.deleteMany({});
    await CustomerVerification.deleteMany({});
  });
  // error
  describe('test error', () => {
    // name
    // should throw error ZodError if \'name\' is missing
    it('should throw error ZodError if \'name\' is missing', async () => {
      const req = {
        body: {
          ...mockCustomer,
          name: undefined,
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('name');
        expect(error.errors[0].message).toBe('Nama harus diisi.');
      }
    });
    // should throw error ZodError if \'name\' is not string
    it('should throw error ZodError if \'name\' is not string', async () => {
      const req = {
        body: {
          ...mockCustomer,
          name: 9854958945,
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('name');
        expect(error.errors[0].message).toBe('Nama harus diisi berupa string.');
      }
    });
    // should throw error ZodError if \'name\' has less than 3 chars
    it('should throw error ZodError if \'name\' has less than 3 chars', async () => {
      const req = {
        body: {
          ...mockCustomer,
          name: 'dd',
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('name');
        expect(error.errors[0].message).toBe('Nama minimal memiliki 3 karakter.');
      }
    });
    // should throw error ZodError if \'name\' has more than 50 chars
    it('should throw error ZodError if \'name\' has more than 50 chars', async () => {
      const req = {
        body: {
          ...mockCustomer,
          name: 'sdfsd sdfsdfsd sdfsdf sdfsdf sdfsdf sdfsdf sdfsdf sdfsdf \'',
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('name');
        expect(error.errors[0].message).toBe('Nama maksimal memiliki 50 karakter.');
      }
    });
    // should throw error ZodError if \'name\' breaks regex
    it('should throw error ZodError if \'name\' breaks regex', async () => {
      const req = {
        body: {
          ...mockCustomer,
          name: '%^$%%$%$%',
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('name');
        expect(error.errors[0].message).toBe('Silakan gunakan karakter a-z A-Z 0-9 . , _ - \'');
      }
    });
    // username
    // should throw error ZodError if \'username\' is missing
    it('should throw error ZodError if \'username\' is missing', async () => {
      const req = {
        body: {
          ...mockCustomer,
          username: undefined,
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('username');
        expect(error.errors[0].message).toBe('Username harus diisi.');
      }
    });
    // should throw error ZodError if \'username\' is not string
    it('should throw error ZodError if \'username\' is not string', async () => {
      const req = {
        body: {
          ...mockCustomer,
          username: 0,
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('username');
        expect(error.errors[0].message).toBe('Username harus diisi dan berupa string.');
      }
    });
    // should throw error ZodError if \'username\' has less than 3 chars
    it('should throw error ZodError if \'username\' has less than 3 chars', async () => {
      const req = {
        body: {
          ...mockCustomer,
          username: 'hi',
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('username');
        expect(error.errors[0].message).toBe('Username minimal memiliki 3 karakter.');
      }
    });
    // should throw error ZodError if \'username\' has more than 30 chars
    it('should throw error ZodError if \'username\' has more than 30 chars', async () => {
      const req = {
        body: {
          ...mockCustomer,
          username: 'fghfgjghfgjfhgfjgjfgfhgjfhjfhjghjfhgjfhgjfhg',
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('username');
        expect(error.errors[0].message).toBe('Username maksimal memiliki 30 karakter.');
      }
    });
    // should throw error ZodError if \'username\' breaks regex
    it('should throw error ZodError if \'username\' breaks regex', async () => {
      const req = {
        body: {
          ...mockCustomer,
          username: 'Dfgfkgjkjfgkfg',
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('username');
        expect(error.errors[0].message).toBe('Silakan gunakan karakter a-z 0-9 . _');
      }
    });
    // should throw error code 11000 of \'username\' is duplicate
    it('should throw error if \'username\' is duplicate', async () => {
      await Customer.create({
        username: mockCustomer.username,
        name: mockCustomer.name,
        email: 'anotheremail@gmail.com',
        password: mockCustomer.password,
      })

      const req = {
        body: {
          ...mockCustomer,
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrowError();

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error.code).toBe(11000);
      }
    });
    // email
    // should throw error ZodError if \'email\' is missing
    it('should throw error ZodError if \'email\' is missing', async () => {
      const req = {
        body: {
          ...mockCustomer,
          email: undefined,
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('email');
        expect(error.errors[0].message).toBe('Email harus diisi.');
      }
    });
    // should throw error ZodError if \'email\' is not string
    it('should throw error ZodError if \'email\' is not string', async () => {
      const req = {
        body: {
          ...mockCustomer,
          email: 0,
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('email');
        expect(error.errors[0].message).toBe('Email harus diisi dan berupa string.');
      }
    });
    // should throw error ZodError if \'email\' is not valid email
    it('should throw error ZodError if \'email\' is not valid email', async () => {
      const req = {
        body: {
          ...mockCustomer,
          email: 'hello@hidayha',
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('email');
        expect(error.errors[0].message).toBe('Email tidak valid.');
      }
    });
    // should throw error ZodError if \'email\' has more than 254 chars
    it('should throw error ZodError if \'email\' has more than 254 chars', async () => {
      const req = {
        body: {
          ...mockCustomer,
          email: 'fghfgjghfgjfhgfjgjfgfhgjfhjfhjghjfhgjfhgjfhgjdhfgjdfjghdjfhgjdfjgdjfgdfhgjdfhgjdfhgjhdfgdfjgdfjgjdfhgjdfhjghdfjjdfvnjdfvnjdfnvjdfnvjdfnjdfgfghfgjghfgjfhgfjgjfgfhgjfhjfhjghjfhgjfhgjfhgjdhfgjdfjghdjfhgjdfjgdjfgdfhgjdfhgjdfhgjhdfgdfjgdfjgjdfhgjdfhjghdfjjdfvn@gmail.com',
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('email');
        expect(error.errors[0].message).toBe('Email maksimal memiliki 254 karakter.');
      }
    });
    // should throw error ZodError if \'email\' is duplicate
    it('should throw error ZodError if \'email\' is duplicate', async () => {
      await Customer.create({
        username: 'antoherusername',
        name: mockCustomer.name,
        email: mockCustomer.email,
        password: mockCustomer.password,
      })

      const req = {
        body: {
          ...mockCustomer,
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrowError();

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error.code).toBe(11000);
      }
    });
    // password
    // should throw error ZodError if \'password\' is missing
    it('should throw error ZodError if \'password\' is missing', async () => {
      const req = {
        body: {
          ...mockCustomer,
          password: undefined,
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('password');
        expect(error.errors[0].message).toBe('Password harus diisi.');
      }
    });
    // should throw error ZodError if \'password\' is not string
    it('should throw error ZodError if \'password\' is not string', async () => {
      const req = {
        body: {
          ...mockCustomer,
          password: 0,
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('password');
        expect(error.errors[0].message).toBe('Password harus diisi dan berupa string.');
      }
    });
    // should throw error ZodError if \'password\' is has less than 6 chars
    it('should throw error ZodError if \'password\' has less than 6 chars', async () => {
      const req = {
        body: {
          ...mockCustomer,
          password: 'dd',
        }
      } as unknown as Request;

      await expect(() => authService.signupForm(req)).rejects.toThrow(ZodError);

      try {
        await authService.signupForm(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ZodError);
        expect(error.errors[0].path[0]).toBe('password');
        expect(error.errors[0].message).toBe('Password minimal memiliki 6 karakter.');
      }
    });
  });
  // success
  describe('test success', () => {
    // should return id of customer account and create email verification
    it('should return id of customer account and create email verification', async () => {
      const req = {
        body: {
          name: mockCustomer.name + '\'',
          username: mockCustomer.username,
          email: mockCustomer.email,
          password: mockCustomer.password,
        },
      } as unknown as Request;

      const signupCustomer = await authService.signupForm(req);
      const findCustomer = await Customer.findById(signupCustomer);
      const checkCustomerHashPassword =
        await bcrypt.compare(mockCustomer.password, findCustomer!.password);
      const findCustomerEmailVerification =
        await CustomerVerification.findOne({ customerId: findCustomer!._id});

      expect(mongoose.Types.ObjectId.isValid(signupCustomer.toString())).toBe(true);
      expect(findCustomer!.name).toBe(mockCustomer.name + '\'');
      expect(findCustomer!.email).toBe(mockCustomer.email);
      expect(findCustomer!.username).toBe(mockCustomer.username);
      expect(checkCustomerHashPassword).toBe(true);
      expect(findCustomerEmailVerification).not.toBeNull();
    });
  });
});
// test signinForm
describe('test signinForm', () => {
  beforeAll(async () => {
    await mongoose.connect(config.urlDb);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const req = {
      body: {
        ...mockCustomer,
      },
    } as unknown as Request;
    await authService.signupForm(req);
  });
  
  afterEach(async () => {
    await Customer.deleteMany({});
    await CustomerVerification.deleteMany({});
  });
  // error
  // should thow error BadRequest if 'email' is missing
  it('should thow error BadRequest if \'email\' is missing', async () => {
    const req = {
      body: {
        password: 'hello',
      }
    } as unknown as Request;

    await expect(() => authService.signinForm(req)).rejects.toThrow(BadRequest);

    try {
      await authService.signinForm(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.message).toBe('Invalid Request. Please check your input data.');
    }
  });
  // should thow error BadRequest if \'password\' is missing
  it('should thow error BadRequest if \'password\' is missing', async () => {
    const req = {
      body: {
        email: 'hello@gmail.com',
      }
    } as unknown as Request;

    await expect(() => authService.signinForm(req)).rejects.toThrow(BadRequest);

    try {
      await authService.signinForm(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.message).toBe('Invalid Request. Please check your input data.');
    }
  });
  // should thow error Unauthorized if email is not match with any data
  it('should thow error Unauthorized if email is not match with any data', async () => {
    const req = {
      body: {
        password: mockCustomer.password,
        email: 'wrongemail@gmal.com',
      }
    } as unknown as Request;

    await expect(() => authService.signinForm(req)).rejects.toThrow(Unauthorized);

    try {
      await authService.signinForm(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Unauthorized);
      expect(error.message).toBe('Credential Error. User is not exist.');
    }
  });
  // should thow error Unauthorized if username is not match with any data
  it('should thow error Unauthorized if username is not match with any data', async () => {
    const req = {
      body: {
        password: mockCustomer.password,
        email: 'wrongusername',
      }
    } as unknown as Request;

    await expect(() => authService.signinForm(req)).rejects.toThrow(Unauthorized);

    try {
      await authService.signinForm(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Unauthorized);
      expect(error.message).toBe('Credential Error. User is not exist.');
    }
  });
  // should thow error Unauthorized if password is not match
  it('should thow error Unauthorized if username is not match with any data', async () => {
    const req = {
      body: {
        email: mockCustomer.email,
        password: 'wrongpassword',
      }
    } as unknown as Request;

    await expect(() => authService.signinForm(req)).rejects.toThrow(Unauthorized);

    try {
      await authService.signinForm(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Unauthorized);
      expect(error.message).toBe('Credential Error. User is not exist.');
    }
  });
  // success
  // should return result ICustomer
  it('should return result ICustomer', async () => {
    const req = {
      body: {
        email: mockCustomer.email,
        password: mockCustomer.password,
      }
    } as unknown as Request;

    const successSigninCustomer = await authService.signinForm(req) as ICustomer;
    expect(successSigninCustomer).toHaveProperty('_id');
    expect(successSigninCustomer!.name).toBe(mockCustomer.name);
    expect(successSigninCustomer!.username).toBe(mockCustomer.username);
    expect(successSigninCustomer!.email).toBe(mockCustomer.email);
  });
});
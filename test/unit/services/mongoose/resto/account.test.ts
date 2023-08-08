import { Request } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import config from '../../../../../src/config';
import Restaurant from '../../../../../src/models/Restaurant';
import RestaurantVerification from '../../../../../src/models/RestaurantVerification';
import { checkingEmailVerification, checkingResetPassword, createReEmailVerificationRequest, createResetPasswordRequest } from '../../../../../src/services/mongoose/resto/account';
import { BadRequest, NotFound } from '../../../../../src/errors';
import Conflict from '../../../../../src/errors/Conflict';
import InvalidToken from '../../../../../src/errors/InvalidToken';
import RestaurantResetPasswordRequest from '../../../../../src/models/RestauranResetPasswordRequest';

// testing createReEmailVerificationRequest
describe('testing createReEmailVerificationRequest', () => {
  const signupRestaurantData = {
    username: 'warungmakanenak',
    name: 'Warung Makan Enak',
    email: 'warungmakanenak@gmail.com',
    password: 'warungmakan12345',
  };

  beforeEach(async () => {
    await mongoose.connect(config.urlDb);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await RestaurantVerification.deleteMany({}); 
    await mongoose.connection.close();
  });
  // error
  // should throw error if email body property is not exist
  it('should throw error if email body property is not exist', async () => {
    const req = {
      body: {}
    } as unknown as Request;

    try {
      await createReEmailVerificationRequest(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('email');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw error if email value is not valid as email (Zod)
  it('should throw error if email body property is not exist', async () => {
    const req = {
      body: {
        email: 'hellosdfjsdhf@sfsdf'
      }
    } as unknown as Request;

    try {
      await createReEmailVerificationRequest(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('email');
      expect(error.errors[0].message).toBe('Invalid email');
    }
  });
  // should not create email verification if account with email request is not match
  it('should not create email verification if account with email request is not match', async () => {
    const restaurant = await Restaurant.create({
      ...signupRestaurantData,
    });

    const req = {
      body: { email: 'warungmakanenak@gmail.co' }
    } as unknown as Request;

    await createReEmailVerificationRequest(req);
    const emailVerification = await RestaurantVerification.findOne();
    expect(emailVerification).toBeNull();
  });
  // should not create email verification if account with email request is match but account is already verified
  it(
    'should not create email verification if account with email request is match but account is already verified',
    async () => {
      const restaurant = await Restaurant.create({
        ...signupRestaurantData,
        isVerified: true,
      });
  
      const req = {
        body: { email: 'warungmakanenak@gmail.co' }
      } as unknown as Request;

      await createReEmailVerificationRequest(req);
      const emailVerification = await RestaurantVerification.findOne();
      expect(emailVerification).toBeNull();
  });
  // success
  // should create email verification if account with email is match and account is not verified
  it('should create email verification if account with email is match and account is not verified', async () => {
    const restaurant = await Restaurant.create({
      ...signupRestaurantData,
    });

    const req = {
      body: { email: signupRestaurantData.email }
    } as unknown as Request;

    await createReEmailVerificationRequest(req);
    const emailVerification = await RestaurantVerification.findOne();
    expect(emailVerification!.email).toBe(restaurant.email);
    expect(emailVerification!.restaurantId).toStrictEqual(restaurant._id);
    const comparingTime =
      dayjs(emailVerification!.expiredAt).isSame(
        dayjs(restaurant!.createdAt).add(10, 'minutes'),
        'minutes',
      );
    expect(comparingTime).toBe(true);
  });
});

// testing checkingEmailVerification
describe('testing checkingEmailVerification', () => {
  const signupRestaurantData = {
    username: 'warungmakanenak',
    name: 'Warung Makan Enak',
    email: 'warungmakanenak@gmail.com',
    password: 'warungmakan12345',
  };

  beforeEach(async () => {
    await mongoose.connect(config.urlDb);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await RestaurantVerification.deleteMany({}); 
    await mongoose.connection.close();
  });
  // error
  // should throw new BadRequest('Invalid Request. Please check your input data.') if email propert;
  it('should throw BadRequest if uniqueString params does not exist', async () => {
    const req = {
      params: {}
    } as unknown as Request;

    try {
      await checkingEmailVerification(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });
  // should throw new NotFound if no match verification with uniqueString
  it('should throw new NotFound if no match verification with uniqueString', async () => {
    const uniqueString = uuidv4();

    const req = {
      params: { uniqueString }
    } as unknown as Request;

    try {
      await checkingEmailVerification(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFound);
    }
  });
  // should throw new Conflict if account is already verified
  it('should throw new Conflict if account is already verified', async () => {
    const restaurant = await Restaurant.create({
      username: signupRestaurantData.username,
      name: signupRestaurantData.name,
      password: signupRestaurantData.password,
      email: signupRestaurantData.email,
      isVerified: true,
    });

    const restaurantVerification = await RestaurantVerification.create({
      restaurantId: restaurant._id,
      email: restaurant.email,
      uniqueString: uuidv4(),
      expiredAt: dayjs().add(10, 'minutes').toISOString(),
    });

    const req = {
      params: {
        uniqueString: restaurantVerification.uniqueString,
      }
    } as unknown as Request;

    try {
      await checkingEmailVerification(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Conflict);
    }
  });

  // should throw new InvalidToken if verification is expired
  it('should throw new InvalidToken if verification is expired', async () => {
    const restaurant = await Restaurant.create({
      username: signupRestaurantData.username,
      name: signupRestaurantData.name,
      password: signupRestaurantData.password,
      email: signupRestaurantData.email,
    });

    const restaurantVerification = await RestaurantVerification.create({
      restaurantId: restaurant._id,
      email: restaurant.email,
      uniqueString: uuidv4(),
      expiredAt: dayjs().toISOString(),
    });

    const req = {
      params: {
        uniqueString: restaurantVerification.uniqueString,
      }
    } as unknown as Request;

    try {
      await checkingEmailVerification(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(InvalidToken);
    }
  });
  // success
  // should change isVerified to be true
  it('should change isVerified to be true', async () => {
    const restaurant = await Restaurant.create({
      username: signupRestaurantData.username,
      name: signupRestaurantData.name,
      password: signupRestaurantData.password,
      email: signupRestaurantData.email,
    });

    const restaurantVerification = await RestaurantVerification.create({
      restaurantId: restaurant._id,
      email: restaurant.email,
      uniqueString: uuidv4(),
      expiredAt: dayjs().add(10, 'minutes').toISOString(),
    });

    const req = {
      params: {
        uniqueString: restaurantVerification.uniqueString,
      }
    } as unknown as Request;

    await checkingEmailVerification(req);
    const verifiedRestaurant = await Restaurant.findById(restaurant._id);
    expect(verifiedRestaurant!.isVerified).toBe(true);
  });
});

// testing createResetPasswordRequest
describe('testing createResetPasswordRequest', () => {
  const signupRestaurantData = {
    username: 'warungmakanenak',
    name: 'Warung Makan Enak',
    email: 'warungmakanenak@gmail.com',
    password: 'warungmakan12345',
  };

  beforeEach(async () => {
    await mongoose.connect(config.urlDb);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await RestaurantResetPasswordRequest.deleteMany({}); 
    await mongoose.connection.close();
  });
  // error
  // should throw error if email body property is not exist
  it('should throw error if email body property is not exist', async () => {
    const req = {
      body: {},
    } as unknown as Request;

    try {
      await createResetPasswordRequest(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('email');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw error if email value is not valid as email (Zod)
  it('should throw error if email value is not valid as email (Zod)', async () => {
    const req = {
      body: {
        email: 'hellohidayah@co'
      },
    } as unknown as Request;

    try {
      await createResetPasswordRequest(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('email');
      expect(error.errors[0].message).toBe('Invalid email');
    }
  });
  // should not create reset password if no match account with email
  it('should not create reset password if no match account with email', async () => {
    const req = {
      body: {
        email: 'warungmakanenak@gmail.co'
      },
    } as unknown as Request;

    await Restaurant.create({
      ...signupRestaurantData,
    });
    await createResetPasswordRequest(req);
    const result = await RestaurantResetPasswordRequest.findOne();
    expect(result).toBeNull();
  });
  // success
  // should create reset password request with valid email account
  it('should not create reset password if no match account with email', async () => {
    const req = {
      body: {
        email: signupRestaurantData.email,
      },
    } as unknown as Request;

    const restaurant = await Restaurant.create({
      ...signupRestaurantData,
      isVerified: true,
    });
    await createResetPasswordRequest(req);
    const result = await RestaurantResetPasswordRequest.findOne();
    expect(result!.restaurantId).toStrictEqual(restaurant._id);
  });
});

// testing checkingResetPassword
describe('testing checkingResetPassword', () => {
  const signupRestaurantData = {
    username: 'warungmakanenak',
    name: 'Warung Makan Enak',
    email: 'warungmakanenak@gmail.com',
    password: 'warungmakan12345',
  };

  beforeEach(async () => {
    await mongoose.connect(config.urlDb);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await RestaurantResetPasswordRequest.deleteMany({}); 
    await mongoose.connection.close();
  });
  // error
  // should throw BadRequest if no uniqueString params
  it('should throw BadRequest if no uniqueString params', async () => {
    const req = {
      params: {},
    } as unknown as Request;

    try {
      await checkingResetPassword(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });
  // should throw NotFound if no mact uniqueString in data
  it('should throw NotFound if no mact uniqueString in data', async () => {
    const restaurant = await Restaurant.create({
      ...signupRestaurantData,
      isVerified: true,
    });

    await RestaurantResetPasswordRequest.create({
      restaurantId: restaurant._id,
      uniqueString: uuidv4(),
      expiredAt: dayjs().add(10, 'minutes').toISOString(),
    });

    const req = {
      params: {
        uniqueString: uuidv4(),
      },
    } as unknown as Request;

    try {
      await checkingResetPassword(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFound);
    }
  });
  // should throw InvalidToekn if request is expired
  it('should throw InvalidToekn if request is expired', async () => {
    const restaurant = await Restaurant.create({
      ...signupRestaurantData,
      isVerified: true,
    });

    const resetPasswordRequest = await RestaurantResetPasswordRequest.create({
      restaurantId: restaurant._id,
      uniqueString: uuidv4(),
      expiredAt: dayjs().toISOString(),
    });

    const req = {
      params: {
        uniqueString: resetPasswordRequest.uniqueString,
      },
    } as unknown as Request;

    try {
      await checkingResetPassword(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(InvalidToken);
    }
  });
  // success
  // should not throw error
  it('should not throw error', async () => {
    const restaurant = await Restaurant.create({
      ...signupRestaurantData,
      isVerified: true,
    });

    const resetPasswordRequest = await RestaurantResetPasswordRequest.create({
      restaurantId: restaurant._id,
      uniqueString: uuidv4(),
      expiredAt: dayjs().add(10, 'minutes').toISOString(),
    });

    const req = {
      params: {
        uniqueString: resetPasswordRequest.uniqueString,
      },
    } as unknown as Request;

    const result = await checkingResetPassword(req);
    expect(result).toBe(undefined);
  });
});
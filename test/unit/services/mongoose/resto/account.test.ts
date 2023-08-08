import { Request } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import dayjs from 'dayjs';

import config from '../../../../../src/config';
import Restaurant from '../../../../../src/models/Restaurant';
import RestaurantVerification from '../../../../../src/models/RestaurantVerification';
import { createReEmailVerificationRequest } from '../../../../../src/services/mongoose/resto/account';

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
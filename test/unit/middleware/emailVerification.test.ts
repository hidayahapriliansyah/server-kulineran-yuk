import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Restaurant from '../../../src/models/Restaurant';
import config from '../../../src/config';
import { isEmailRestoVerified } from '../../../src/middleware/emailVerification';
import { Unauthenticated, Unauthorized } from '../../../src/errors';

const createNextMock = (): NextFunction => jest.fn() as NextFunction;
describe('isEmailRestoVerified', () => {
  beforeEach(async () => {
    await mongoose.connect(config.urlDb);
    const restaurantSignupData = {
      username: 'restousername123',
      name: 'Resto 1234',
      email: 'resto1234@gmail.com',
      password: 'hellopasswrod',
    };
    await Restaurant.create(restaurantSignupData);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await mongoose.connection.close();
  });
  // error
  // should called next with unauthenticated error if restaurant is null
  it('should called next with unauthenticated error if restaurant is null', async () => {
    const _id = 'sdfsdfsdfsdfsdfsdfuerthweur';
    const req = { user: { _id } } as unknown as Request;

    const res = {} as Response;
    const next = createNextMock();
    await isEmailRestoVerified(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(
      new Unauthenticated(
        'Access denied. Please authenticate to access this resource.'
      )
    );
  });
  // success
  // should called next function with unauthorized and not adding res.locals.isEmailVerified = false
  it('should called next function with unauthorized and adding res.locals.isEmailVerified = false if email is not verified', async () => {
    const restaurant = await Restaurant.findOne({});
    const { _id } = restaurant!;
    const req = { user: { _id } } as unknown as Request;

    const res = {} as Response;
    const next = createNextMock();
    await isEmailRestoVerified(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(new Unauthorized('Access denied. Please verify your email.'));
  });
  // should called next function without parameter and adding res.locals.isEmailVerified = true
  it('should called next function without parameter and adding res.locals.isEmailVerified = true', async () => {
    const restaurant = await Restaurant.findOne({});
    const { _id } = restaurant!;
    await Restaurant.findOneAndUpdate({ _id }, { isVerified: true });
    const req = { user: { _id } } as unknown as Request;

    const res = {} as Response;
    const next = createNextMock();
    await isEmailRestoVerified(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});

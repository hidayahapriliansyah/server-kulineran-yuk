import mongoose from 'mongoose';
import config from '../../../src/config';
import Restaurant from '../../../src/models/Restaurant';
import { createAccessToken, createJWTPayloadDataRestoAccessToken, isAccessTokenValid } from '../../../src/utils';
import { Unauthenticated } from '../../../src/errors';
import { JsonWebTokenError } from 'jsonwebtoken';

// createaccesstoken resto
describe('createAccessToken', () => {
  const username = 'hello123';
  const name = 'Hello Hidayah';
  const email = 'hidayahapriliansyah@gmail.com';
  const password = '123456789';

  beforeEach(async () => {
    await mongoose.connect(config.urlDb);
    await Restaurant.create({
      username,
      name,
      email,
      password,
    });
  });

  afterEach(async () => {
    await Restaurant.deleteMany({});
    await mongoose.connection.close();
  });

  // success
  // shoudl retrun acess token payload data
  it('shoudl retrun acess token payload data', async () => {
    const restaurant = await Restaurant.findOne({});
    const payload = createJWTPayloadDataRestoAccessToken(restaurant!);
    const accessToken = createAccessToken({
      payload,
      userType: 'resto'
    });
    const isValidToken = isAccessTokenValid({ token: accessToken, userType: 'resto' });
    expect(isValidToken).toHaveProperty('_id');
    expect(isValidToken).toHaveProperty('email');
    expect(isValidToken).toHaveProperty('exp');
    expect(isValidToken).toHaveProperty('iat');
  });
});

// isaccesstokenvalid resto
describe('isAccessTokenValid', () => {
  // error
  // should throw unauthentitUnauthenticated error if token is acak acakan
  it('should throw unauthentitUnauthenticated error if token is acak acakan', () => {
    try {
      isAccessTokenValid({ token: 'fdfdfdfd', userType: 'resto' });
    } catch (error: any) {
      expect(error).toBeInstanceOf(JsonWebTokenError);
    }
  });
});
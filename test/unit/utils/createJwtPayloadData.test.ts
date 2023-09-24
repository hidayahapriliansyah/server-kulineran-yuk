import mongoose from 'mongoose';
import Restaurant from '../../../src/models/Restaurant';
import config from '../../../src/config';
import {
  createJWTPayloadDataRestoAccessToken,
  createJWTPayloadDataRestoIDToken,
} from '../../../src/utils';

describe('createJWTPayloadDataRestoAccessToken', () => {
  const username = 'hello12';
  const name = 'Hello Hidayah';
  const email = 'hidayahapriliansya@gmail.com';
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
  // should create relevan payload with Restaurant data
  it('should create relevan access token payload with Restaurant data', async () => {
    const restaurant = await Restaurant.findOne();
    const { _id, email } = restaurant!;
    const createdPayload = createJWTPayloadDataRestoAccessToken(restaurant!);
    expect(Object.keys(createdPayload)).toHaveLength(2);
    expect(createdPayload._id).toBe(_id);
    expect(createdPayload.email).toBe(email);
  });
});

describe('createJWTPayloadDataRestoIDToken', () => {
  const username = 'hello123xx';
  const name = 'Hello Hidayah';
  const email = 'hidayahapriliansyahxx@gmail.com';
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

  // should create relevan payload with Restaurant data
  it('should create relevan id token payload with Restaurant data', async () => {
    const restaurant = await Restaurant.findOne({});
    const { _id, email } = restaurant!;
    const createdPayload = createJWTPayloadDataRestoIDToken(restaurant!);
    expect(Object.keys(createdPayload)).toHaveLength(4);
    expect(createdPayload.name).toBe(restaurant!.name);
    expect(createdPayload.username).toBe(restaurant!.username);
    expect(createdPayload.avatar).toBe(restaurant!.avatar);
    expect(createdPayload.email).toBe(restaurant!.email);
  });
});

import mongoose from 'mongoose';
import { Request } from 'express';
import { getRegency } from '../../../../../src/services/mongoose/location/regency';
import config from '../../../../../src/config';
import { BadRequest, NotFound } from '../../../../../src/errors';

beforeEach(async () => {
  await mongoose.connect(config.urlDb);
});

describe('getRegency', () => {
  // should return regency base on province query url
  it('should return regency base on province query url ', async () => {
    const req = { query: { province: '32' } } as unknown as Request;

    const result = await getRegency(req);
    expect(result.length).toBe(27);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('provinceId');
    expect(result[0]).toHaveProperty('regency');
  });
  
  // should throw bad request error query value is empty
  it('should throw bad request error query value is empty', async () => {
    const req = { query: {} } as unknown as Request;
    try {
      await getRegency(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });

  // should throw bad request error if there's no province query key
  it('should throw bad request error if there\'s no province query key', async () => {
    const req = { query: { prov: '' } } as unknown as Request;

    try {
      await getRegency(req);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });

  // should throw bad request error if province value is empty string
  it('should throw bad request error if province value is empty string', async () => {
    const req = { query: { province: '' } } as unknown as Request;
    try {
      await getRegency(req);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });

  // should throw notfound error if province id is wrong (not included on db)
  it('should throw notfound error if province id is wrong (not included on db)', async () => {
    const req = { query: { province: '40' } } as unknown as Request;

    try {
      await getRegency(req);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFound);
    }
  });
});

afterEach(async () => {
  await mongoose.connection.close();
})
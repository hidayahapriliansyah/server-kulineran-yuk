import mongoose from 'mongoose';
import { Request } from 'express';
import { getDistrict } from '../../../../../src/services/mongoose/location/district';
import config from '../../../../../src/config';
import { BadRequest, NotFound } from '../../../../../src/errors';

beforeEach(async () => {
  await mongoose.connect(config.urlDb);
});

describe('getDistrict', () => {
  // should return regency base on district query url
  it('should return regency base on district query url ', async () => {
    const req = { query: { regency: '3206' } } as unknown as Request;

    const result = await getDistrict(req);
    expect(result.length).toBe(39);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('regencyId');
    expect(result[0]).toHaveProperty('district');
  });

  // should throw bad request error query value is empty
  it('should throw bad request error query value is empty', async () => {
    const req = { query: {} } as unknown as Request;
    try {
      await getDistrict(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });

  // should throw bad request error if there's no regency query key
  it("should throw bad request error if there's no regency query key", async () => {
    const req = { query: { resdfsdf: '' } } as unknown as Request;

    try {
      await getDistrict(req);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });

  // should throw bad request error if regency value is empty string
  it('should throw bad request error if regency value is empty string', async () => {
    const req = { query: { regency: '' } } as unknown as Request;
    try {
      await getDistrict(req);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });

  // should throw notfound error if regency id is wrong (not included on db)
  it('should throw notfound error if regency id is wrong (not included on db)', async () => {
    const req = { query: { regency: '40sds' } } as unknown as Request;

    try {
      await getDistrict(req);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFound);
    }
  });
});

afterEach(async () => {
  await mongoose.connection.close();
});

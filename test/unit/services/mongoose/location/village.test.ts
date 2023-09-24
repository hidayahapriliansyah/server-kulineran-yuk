import mongoose from 'mongoose';
import { Request } from 'express';
import { getVillage } from '../../../../../src/services/mongoose/location/village';
import config from '../../../../../src/config';
import { BadRequest, NotFound } from '../../../../../src/errors';

beforeEach(async () => {
  await mongoose.connect(config.urlDb);
});

describe('getVillage', () => {
  // should return village base on village query url
  it('should return village base on village query url ', async () => {
    const req = { query: { district: '3206161' } } as unknown as Request;

    const result = await getVillage(req);
    expect(result.length).toBe(7);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('distrcitId');
    expect(result[0]).toHaveProperty('village');
  });

  // should throw bad request error query value is empty
  it('should throw bad request error query value is empty', async () => {
    const req = { query: {} } as unknown as Request;
    try {
      await getVillage(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });

  // should throw bad request error if there's no district query key
  it("should throw bad request error if there's no district query key", async () => {
    const req = { query: { distrsdf: '' } } as unknown as Request;

    try {
      await getVillage(req);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });

  // should throw bad request error if district value is empty string
  it('should throw bad request error if district value is empty string', async () => {
    const req = { query: { district: '' } } as unknown as Request;
    try {
      await getVillage(req);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });

  // should throw notfound error if district id is wrong (not included on db)
  it('should throw notfound error if district id is wrong (not included on db)', async () => {
    const req = { query: { district: '021545154151' } } as unknown as Request;

    try {
      await getVillage(req);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFound);
    }
  });
});

afterEach(async () => {
  await mongoose.connection.close();
});

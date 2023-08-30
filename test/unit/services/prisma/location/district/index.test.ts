import { Request } from 'express';

import * as districtService from '../../../../../../src/services/prisma/location/district';
import * as DTO from '../../../../../../src/services/prisma/location/district/types';
import { BadRequest, NotFound } from '../../../../../../src/errors';

// test getDistrict
describe('test getDistict', () => { 
  // error
  // should throw error BadRequest if regency query is missing
  it('should throw error BadRequest if regency query is missing', async () => {
    const req = { query: {} } as unknown as Request;

    await expect(() => districtService.getDistrict(req))
      .rejects.toThrow(BadRequest);

    try {
      await districtService.getDistrict(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.message).toBe('Invalid Request. regency query is missing. Please check your input.');
    }
  });
  // should throw error NotFound if district is []
  it('should throw error NotFound if district is []', async () => {
    const req = { query: { regency: 'sjdfjsdfh' } } as unknown as Request;

    await expect(() => districtService.getDistrict(req))
      .rejects.toThrow(NotFound);

    try {
      await districtService.getDistrict(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFound);
      expect(error.message).toBe('Resource not found. regency id sjdfjsdfh is not exist');
    }
  });
  // success
  // should return valid result
  it('should return valid result', async () => {
    const req = { query: { regency: '3206' } } as unknown as Request;

    const districts = await districtService.getDistrict(req) as DTO.districtResponse[];
    expect(districts).toHaveLength(39);
    expect(districts[0]).toHaveProperty('id');
    expect(districts[0]).toHaveProperty('regencyId');
    expect(districts[0]).toHaveProperty('district');
  });
});
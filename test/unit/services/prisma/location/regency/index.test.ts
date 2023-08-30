import { Request } from 'express';

import * as regencyService from '../../../../../../src/services/prisma/location/regency';
import * as DTO from '../../../../../../src/services/prisma/location/regency/types';
import { BadRequest, NotFound } from '../../../../../../src/errors';

// test getRegency
describe('tes getRegency', () => {
  // error
  // should throw error BadRequest if province query is missing
  it('should throw error BadRequest if province query is missing', async () => {
    const req = {
      query: {},
    } as unknown as Request;

    await expect(() => regencyService.getRegency(req))
      .rejects.toThrow(BadRequest);
    
    try {
      await regencyService.getRegency(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.message).toBe('Invalid Request. province query is missing. Please check your input.');
    }
  });
  // should throw error NotFound if regencies is []
  it('should throw error NotFound if regencies is []', async () => {
    const req = {
      query: {
        province: 'sjdfsjdfhjsdhf',
      },
    } as unknown as Request;

    await expect(() => regencyService.getRegency(req))
      .rejects.toThrow(NotFound);
  
    try {
      await regencyService.getRegency(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFound);
      expect(error.message).toBe('Resource not found. Province id sjdfsjdfhjsdhf is not exist.');
    }
  });
  // success
  // should return valid result
  it('should return valid result', async () => {
    const req = {
      query: {
        province: '32',
      }
    } as unknown as Request;

    const regencies = await regencyService.getRegency(req) as DTO.RegencyResponse[];
    expect(regencies).toHaveLength(27);
    expect(regencies[0]).toHaveProperty('id');
    expect(regencies[0]).toHaveProperty('provinceId');
    expect(regencies[0]).toHaveProperty('regency');
  });
});
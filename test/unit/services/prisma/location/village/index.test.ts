import { Request } from 'express';

import * as villageService from '../../../../../../src/services/prisma/location/village';
import * as DTO from '../../../../../../src/services/prisma/location/village/types';
import { BadRequest, NotFound } from '../../../../../../src/errors';

// test getVillage
describe('tes getVillage', () => {
  // error
  // should throw error BadRequest if district query is missing
  it('should throw error BadRequest if district query is missing', async () => {
    const req = {
      query: {},
    } as unknown as Request;

    await expect(() => villageService.getVillage(req))
      .rejects.toThrow(BadRequest);
    
    try {
      await villageService.getVillage(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.message).toBe('Invalid Request. district query is missing. Please check your input.');
    }
  });
  // should throw error NotFound if villages is []
  it('should throw error NotFound if villages is []', async () => {
    const req = {
      query: {
        district: 'sjdfsjdfhjsdhf',
      },
    } as unknown as Request;

    await expect(() => villageService.getVillage(req))
      .rejects.toThrow(NotFound);
  
    try {
      await villageService.getVillage(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFound);
      expect(error.message).toBe('Resource not found. district id sjdfsjdfhjsdhf is not exist.');
    }
  });
  // success
  // should return valid result
  it('should return valid result', async () => {
    const req = {
      query: {
        district: '3206161',
      }
    } as unknown as Request;

    const villages = await villageService.getVillage(req) as DTO.VillageResponse[];
    expect(villages).toHaveLength(7);
    expect(villages[0]).toHaveProperty('id');
    expect(villages[0]).toHaveProperty('districtId');
    expect(villages[0]).toHaveProperty('village');
  });
});

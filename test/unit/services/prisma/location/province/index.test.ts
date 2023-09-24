import * as provinceService from '../../../../../../src/services/prisma/location/province';

describe('test getAllProvince', () => { 
  it('should return 34 item of provinces', async () => {
    const provinces = await provinceService.getAllProvinces();

    expect(provinces).toHaveLength(34);
    expect(provinces[0]).toHaveProperty('id');
    expect(provinces[0]).toHaveProperty('province');
  });
});
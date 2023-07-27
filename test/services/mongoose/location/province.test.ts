import mongoose from 'mongoose';
import { IProvinceDTO, getAllProvinces } from '../../../../src/services/mongoose/location/province';
import config from '../../../../src/config';

// if need connection to db => create connection first tho

beforeEach(async () => {
  await mongoose.connect(config.urlDb);
});

describe('getAllProvinces', () => {
  // should return collection of 34 province with each document has property id and province
  it('should return collection of 34 province with each document has property id and province', async () => {
    const result: IProvinceDTO[] = await getAllProvinces();
    expect(result.length).toBe(34);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('province');
  });
});

afterEach(async () => {
  await mongoose.connection.close();
})
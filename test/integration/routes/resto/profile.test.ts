import mongoose from 'mongoose';
import config from '../../../../src/config';
import Restaurant from '../../../../src/models/Restaurant';

// /profile
describe('profile', () => {
  beforeAll(async () => {
    await mongoose.connect(config.urlDb);
  });

  afterAll(async () => {
    await Restaurant.deleteMany({});
    await mongoose.connection.close();
  });

  // error
  // success
  // should give restaurant information
});
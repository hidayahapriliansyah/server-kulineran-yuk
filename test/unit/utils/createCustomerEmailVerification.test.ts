import mongoose from 'mongoose';
import createCustomerEmailVerification from '../../../src/utils/createCustomerEmailVerification';
import config from '../../../src/config';
import Customer from '../../../src/models/Customer';
import { customerSignup as mockCustomer } from '../../mock/customer';
import CustomerVerification from '../../../src/models/CustomerVerification';
import dayjs from 'dayjs';

// test createCustomerEmailVerification
describe('test createCustomerEmailVerification', () => { 
  beforeAll(async () => {
    await mongoose.connect(config.urlDb);
  });

  afterAll(async () => {
    await Customer.deleteMany({});
    await CustomerVerification.deleteMany({});
    await mongoose.connection.close();
  });
  // success
  // should create customer email verification
  it('should create customer email verification', async () => {
    const customer = await Customer.create({
      name: mockCustomer.name,
      username: mockCustomer.username,
      email: mockCustomer.email,
      password: mockCustomer.password,
    });

    await createCustomerEmailVerification({
      customerId: customer._id,
      customerEmail: customer.email,
    });

    const createdCustomerEmailVerification = await CustomerVerification.findOne({
      customerId: customer._id,
    });

    const compareExpiredTime =
      dayjs(createdCustomerEmailVerification!.expiredAt)
        .isSame(dayjs(customer.createdAt).add(10, 'minutes'), 'minutes');
    
      expect(compareExpiredTime).toBe(true);
  });
});

import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { ICustomer } from '../models/Customer';
import CustomerVerification from '../models/CustomerVerification';

const createCustomerEmailVerification = async ({
  customerId,
  restaurantEmail,
}: {
  customerId: ICustomer['_id'],
  restaurantEmail: ICustomer['email']
}): Promise<void> => {
  const now = dayjs();
  const expiredAt = now.add(10, 'minutes').toISOString();
  const uniqueString = uuidv4();

  await CustomerVerification.create({
    customerId: customerId,
    email: restaurantEmail,
    uniqueString,
    expiredAt,
  });
};

export default createCustomerEmailVerification;

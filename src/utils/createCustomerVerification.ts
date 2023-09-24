import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db';
import { Customer, CustomerVerification } from '@prisma/client';

const createCustomerVerification = async ({
  customerId,
  customerEmail,
}: {
  customerId: Customer['id'],
  customerEmail: Customer['email'],
}): Promise<CustomerVerification> => {
  const now = dayjs();
  const expiredAt = now.add(10, 'minutes').toISOString();
  const uniqueString = uuidv4();

  const createdCustomerEmailVerification = await prisma.customerVerification.create({
    data: {
      customerId,
      email: customerEmail,
      expiredAt,
      uniqueString,
    }
  });
  return createdCustomerEmailVerification; 
};

export default createCustomerVerification;

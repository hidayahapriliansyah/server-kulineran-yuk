import { Customer, Restaurant } from '@prisma/client';
import prisma from '../db';

const findQueueNumberOrder = async ({
  restaurantId,
  customerId,
}: {
  restaurantId: Restaurant['id'],
  customerId: Customer['id'],
}): Promise<number> => {
  const findAcceptedOrderByRestoList = await prisma.order.findMany({
    where: { restaurantId, status: 'ACCEPTED_BY_RESTO' },
  });
  const queueNumber = findAcceptedOrderByRestoList
    .findIndex((order) => order.customerId === customerId) + 1;
  return queueNumber;
};

export default findQueueNumberOrder;

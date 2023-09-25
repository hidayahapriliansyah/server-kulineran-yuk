import { BotramGroup, Order, Restaurant } from '@prisma/client';

type PurchaseNotBotramItem = {
  id: Order['id'],
  createdAt: Order['createdAt'],
  isGroup: Order['isGroup'],
  restaurant: {
    id: Restaurant['id'],
    username: Restaurant['username'],
    name: Restaurant['name'],
  },
  isPaid: Order['isPaid'],
  status: 'ACCEPTED_BY_CUSTOMER',
  total: Order['total'],
};

type PurchaseBotramItem = PurchaseNotBotramItem & {
  botramGroup: {
    id: BotramGroup['id'],
    name: BotramGroup['name'],
  }
};

type PurchasedOrderResponse = (PurchaseNotBotramItem | PurchaseBotramItem)[] | [];
type GetPurchaseResponse = {
  orders: PurchasedOrderResponse,
  pages: number,
  total: number,
}

export {
  PurchaseNotBotramItem,
  PurchaseBotramItem,
  PurchasedOrderResponse,
  GetPurchaseResponse,
};

import {
  BotramGroup,
  CustomMenu,
  Menu,
  Order,
  OrderStatus,
  OrderedCustomMenu,
  OrderedMenu,
  Restaurant
} from '@prisma/client';
import { z } from 'zod';

const createOrderBodyRequestSchema = z.object({
  restaurantId: z.string({
    required_error: 'restaurantId harus diisi.',
    invalid_type_error: 'restaurantId harus berupa string.',
  }),
  customerNote: z.string({
    invalid_type_error: 'customerNote harus berupa string.',
  }).max(100, 'customerNote maksimal memiliki 100 karakter.').nullable().optional(),
  orderedItemList: z.object({
    menu: z.array(z.object({
      id: z.string(),
      quantity: z.number(),
      isDibungkus: z.boolean(),
      spicyLevel: z.number().positive().nullable().optional(),
    }), {
      required_error: 'menu harus diisi.',
    }),
    customMenu: z.array(z.object({
      id: z.string(),
      quantity: z.number(),
      isDibungkus: z.boolean(),
      spicyLevel: z.number().positive().nullable().optional(),
    })),
  }, {
    required_error: 'orderedItemList harus diisi.',
    invalid_type_error: 'orderedItemList harus berupa object.',
  }),
});

type CreateOrderBodyRequest = z.infer<typeof createOrderBodyRequestSchema>;

type OrderedMenuPayload = {
  orderedMenu: {
    menuId: Menu['id'],
    menuName: Menu['name'],
    menuPrice: Menu['price'],
    quantity: number,
    totalPrice: number,
    isDibungkus: boolean,
  },
  orderedMenuSpicyLevel: number | null,
};

type OrderedCustomMenuPayload = {
  orderedCustomMenu: {
    customMenuId: CustomMenu['id'],
    customMenuName: CustomMenu['name'],
    customMenuPrice: CustomMenu['price'],
    quantity: number,
    totalPrice: number,
    isDibungkus: boolean,
  },
  orderedCustomMenuSpicyLevel: number | null,
};

type OrderNotBotramItem = {
  id: Order['id'],
  createdAt: Order['createdAt'],
  isGroup: Order['isGroup'],
  restaurant: {
    id: Restaurant['id'],
    username: Restaurant['username'],
    name: Restaurant['name'],
  },
  total: Order['total'],
  isPaid: Order['isPaid'],
  status: Exclude<OrderStatus, 'ACCEPTED_BY_CUSTOMER'>,
  queueNumber: Promise<number> | null,
};

type OrderBotramItem = OrderNotBotramItem & {
  botramGroup: {
    id: BotramGroup['id'],
    name: BotramGroup['name'],
  }
};

type GetOrderListResponse = (OrderNotBotramItem | OrderBotramItem)[] | [];

type OrderedMenuResponse = {
  id: OrderedMenu['id'],
  menu: {
    id: OrderedMenu['menuId'],
    name: OrderedMenu['menuName'],
    price: OrderedMenu['menuPrice'],
  },
  quantity: OrderedMenu['quantity'],
  totalPrice: OrderedMenu['totalPrice'],
  isDibungkus: OrderedMenu['isDibungkus'],
  spicyLevel: number | null,
};

type OrderedCustomMenuResponse = {
  id: OrderedCustomMenu['id'],
  customMenu: {
    id: OrderedCustomMenu['customMenuId'],
    name: OrderedCustomMenu['customMenuName'],
    price: OrderedCustomMenu['customMenuPrice'],
  },
  quantity: OrderedCustomMenu['quantity'],
  totalPrice: OrderedCustomMenu['totalPrice'],
  isDibungkus: OrderedCustomMenu['isDibungkus'],
  spicyLevel: number | null,
};

type OrderNotBotramDetail = {
  id: Order['id'],
  createdAt: Order['createdAt'],
  isGroup: Order['isGroup'],
  restaurant: {
    id: Restaurant['id'],
    username: Restaurant['username'],
    name: Restaurant['name'],
  },
  total: Order['total'],
  status: Order['status'],
  isPaid: Order['isPaid'],
  orderedMenu: OrderedMenuResponse[] | [],
  orderedCustomMenu: OrderedCustomMenuResponse[] | [],
  queueNumber: Promise<number> | null,
};

type OrderBotramDetail = OrderNotBotramDetail & {
  botramGroup: {
    id: BotramGroup['id'],
    name: BotramGroup['name'],
  },
};

type GetOrderByIdResponse = OrderNotBotramDetail | OrderBotramDetail;

export {
  createOrderBodyRequestSchema,
  CreateOrderBodyRequest,
  OrderedMenuPayload,
  OrderedCustomMenuPayload,
  OrderNotBotramItem,
  OrderBotramItem,
  GetOrderListResponse,
  OrderedMenuResponse,
  OrderedCustomMenuResponse,
  OrderNotBotramDetail,
  OrderBotramDetail,
  GetOrderByIdResponse,
}
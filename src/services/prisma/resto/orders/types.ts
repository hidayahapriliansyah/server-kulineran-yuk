import {
  BotramGroup,
  BotramGroupOrder,
  CustomMenu,
  Customer,
  Order,
  OrderedCustomMenu,
  OrderedCustomMenuSpicyLevel,
  OrderedMenu,
  OrderedMenuSpicyLevel,
} from '@prisma/client'

type GetCountOrderResponse = {
  accepted: number,
  processed: number,
  done: number,
  cancel: number,
  total: number,
};

type CustomerOrderNotBotramItem = {
  id: Order['id'],
  createdAt: Order['createdAt'],
  isGroup: Order['isGroup'],
  customer: {
    username: Customer['username'],
    name: Customer['name'],
    image: Customer['avatar'],
  },
  total: Order['total'],
  status: Order['status'],
  isPaid: Order['isPaid'],
}

type CustomerOrderBotramItem = CustomerOrderNotBotramItem & {
  botramGroup: {
    id: BotramGroup['id'],
    name: BotramGroup['name'],
  },
};

type BotramGroupOrderItem = {
  id: BotramGroupOrder['id'],
  createdAt: BotramGroupOrder['createdAt'],
  botramGroup: {
    name: BotramGroup['name'],
    admin: {
      username: Customer['username'],
      name: Customer['name'],
      image: Customer['avatar'],
    }
  },
  total: BotramGroupOrder['totalAmount'],
  status: BotramGroupOrder['status'],
  isPaid: BotramGroupOrder['isPaid'],
};

type GetTodayOrderResponse = {
  orders: (CustomerOrderNotBotramItem | CustomerOrderBotramItem)[] | BotramGroupOrderItem[] | [],
  pages: number,
  total: number
};

type GetAllOrderResponse = {
  orders: (CustomerOrderNotBotramItem | CustomerOrderBotramItem)[] | [],
  pages: number,
  total: number
}

type OrderedMenuDetailResponse = {
  id: OrderedMenu['id'],
  menuId: OrderedMenu['menuId'],
  menuName: OrderedMenu['menuName'],
  menuPrice: OrderedMenu['menuPrice'],
  quantity: OrderedMenu['quantity'],
  totalPrice: OrderedMenu['totalPrice'],
  isDibungkus: OrderedMenu['isDibungkus'],
  spicyLevel: OrderedMenuSpicyLevel['level'] | null,
};

type OrderedCustomMenuDetailResponse = {
  id: OrderedCustomMenu['id'],
  customMenuId: OrderedCustomMenu['customMenuId'],
  customMenuName: OrderedCustomMenu['customMenuName'],
  customMenuPrice: OrderedCustomMenu['customMenuPrice'],
  quantity: OrderedCustomMenu['quantity'],
  totalPrice: OrderedCustomMenu['totalPrice'],
  isDibungkus: OrderedCustomMenu['isDibungkus'],
  spicyLevel: OrderedCustomMenuSpicyLevel['level'] | null,
};

type CustomerOrderDetailResponse = {
  id: Order['id'],
  createdAt: Order['createdAt'],
  isGroup: Order['isGroup'],
  customer: {
    username: Customer['username'],
    name: CustomMenu['name'],
  },
  status: Order['status'],
  isPaid: Order['isPaid'],
  orderedMenu: OrderedMenuDetailResponse[] | [],
  orderedCustomMenu: OrderedCustomMenuDetailResponse[] | [],
};

type BotramGroupOrderDetailResponse = {
  id: BotramGroupOrder['id'],
  createdAt: BotramGroupOrder['createdAt'],
  isGroup: true,
  botramGroup: {
    id: BotramGroup['id'],
    name: BotramGroup['name'],
    admin: {
      username: Customer['username'],
      name: Customer['name'],
    },
  },
  status: BotramGroupOrder['status'],
  isPaid: BotramGroupOrder['isPaid'],
  memberOrder: {
    member: {
      username: Customer['username'],
      name: Customer['name'],
    },
    order: {
      isPaid: Order['isPaid'],
      orderedMenu: OrderedMenuDetailResponse[] | [],
      orderedCustomMenu: OrderedCustomMenuDetailResponse[] | [],
    },
  }[],
};

type GetDetailOrderResponse = CustomerOrderDetailResponse | BotramGroupOrderDetailResponse;

type OrderedMenuWithSpicyLevel = OrderedMenu & {
  orderedMenuSpicyLevel?: {
    level: OrderedMenuSpicyLevel['level'] | undefined,
  } | null,
};

type OrderedCustomMenuWithSpicyLevel = OrderedCustomMenu & {
  orderedCustomMenuSpicyLevel?: {
    level: OrderedCustomMenuSpicyLevel['level'] | undefined,
  } | null,
};

export {
  GetCountOrderResponse,
  CustomerOrderNotBotramItem,
  CustomerOrderBotramItem,
  BotramGroupOrderItem,
  GetTodayOrderResponse,
  GetAllOrderResponse,
  OrderedMenuDetailResponse,
  OrderedCustomMenuDetailResponse,
  CustomerOrderDetailResponse,
  BotramGroupOrderDetailResponse,
  GetDetailOrderResponse,
  OrderedMenuWithSpicyLevel,
  OrderedCustomMenuWithSpicyLevel,
};

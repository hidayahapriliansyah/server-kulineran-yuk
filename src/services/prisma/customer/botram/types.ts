import { z } from 'zod';
import {
  BotramGroup,
  BotramGroupMember,
  Customer,
  Order,
  OrderedCustomMenu,
  OrderedCustomMenuSpicyLevel,
  OrderedMenu,
  OrderedMenuSpicyLevel,
  Restaurant,
} from '@prisma/client';

type BotramResponse = {
  id: BotramGroup['id'],
  createdAt: BotramGroup['createdAt'],
  name: BotramGroup['name'],
  restaurant: {
    id: Restaurant['id'],
    username: Restaurant['username'],
    name: Restaurant['name'],
  },
  admin: {
    username: Customer['username'],
    name: Customer['name'],
  },
  status: 'ORDERING' | 'ALL_READY_ORDER' | 'DONE' | 'REVIEW',
  memberCount: number,
}

type FindCustomerResponse = Pick<Customer, 'id' | 'username' | 'name' | 'avatar'>;

const createBotramGroupBodySchema = z.object({
  restaurantId: z.string({
      required_error: 'restaurantId harus diisi.',
      invalid_type_error: 'restaurantId harus berupa string.',
    }),
  name: z.string({
      required_error: 'name harus diisi.',
      invalid_type_error: 'name harus berupa string.',
    })
    .nonempty('Nama minimal memiliki 1 karakter.')
    .max(30, 'Nama maksimal memiliki 30 karakter.'),
  members: z.array(z.object({
      id: z.string({
        required_error: 'id customer harus diisi.',
        invalid_type_error: 'id harus berupa string.',
      }),
    }), {
      required_error: 'members harus diisi.',
      invalid_type_error: 'members harus berupa array.',
    })
    .nonempty('Members minimal memiliki 1 anggota untuk dimasukkan.')
    .max(50, 'Anggota members maksimal 50 orang.'),
});

type CreateBotramGroupBody = z.infer<typeof createBotramGroupBodySchema>;

type GetAllCustomerBotramGroupResponse = {
  id: BotramResponse['id'],
  createdAt: BotramResponse['createdAt'],
  name: BotramResponse['name'],
  restaurant: BotramResponse['restaurant'],
  status: BotramResponse['status'],
  memberStatus: 'admin' | 'member',
}[] | [];

type MemberOrder = {
  memberDetail: {
    id: BotramGroupMember['id'],
    status: BotramGroupMember['status'],
    username: Customer['id'],
    name: Customer['name'],
  },
  order: {
    id: Order['id'] | null,
    total: Order['total'] | null,
    isPaid: Order['isPaid'] | null,
    orderedMenus: {
      id: OrderedMenu['id'],
      menu: {
        id: OrderedMenu['menuId'],
        name: OrderedMenu['menuName'],
        price: OrderedMenu['menuPrice'],
      },
      quantity: OrderedMenu['quantity'],
      totalPrice: number,
      isDibungkus: OrderedMenu['isDibungkus'],
      spicyLevel: OrderedMenuSpicyLevel['level'] | null,
    }[] | [],
    orderedCustomMenus: {
      id: OrderedCustomMenu['id'],
      customMenu: {
        id: OrderedCustomMenu['customMenuId'],
        name: OrderedCustomMenu['customMenuName'],
        price: OrderedCustomMenu['customMenuPrice'],
      },
      quantity: OrderedCustomMenu['quantity'],
      totalPrice: number,
      isDibungkus: OrderedCustomMenu['isDibungkus'],
      spicyLevel?: OrderedCustomMenuSpicyLevel['level'] | null,
    }[] | [],
  },
};

type GetMemberAndMemberOrderBotramGroup = {
  botramGroupId: BotramGroup['id'],
  myOrder: MemberOrder | null,
  members: MemberOrder[] | [],
};

export {
  BotramResponse,
  createBotramGroupBodySchema,
  CreateBotramGroupBody,
  FindCustomerResponse,
  GetAllCustomerBotramGroupResponse,
  GetMemberAndMemberOrderBotramGroup,
};

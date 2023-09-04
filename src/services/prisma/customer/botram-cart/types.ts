import { BotramCustomMenuCartSpicyLevel, BotramGroup, BotramGroupCustomMenuCart, BotramGroupMenuCart, BotramMenuCartSpicyLevel, CustomMenu, CustomMenuCart, CustomMenuCartSpicyLevel, Menu, MenuCart, MenuCartSpicyLevel, Restaurant } from '@prisma/client';
import { z } from 'zod';

type GetBotramCartResponse =  {
  botramGroup: {
    name: BotramGroup['name'],
    resturant: {
      id: Restaurant['name'],
      username: Restaurant['username'],
      name: Restaurant['name'],
      image: Restaurant['avatar'],
    },
  },
  totalCartItem: number,
} | null;

const addMenuToBotramCartBodySchema = z.object({
  botramGroupId: z.string({
      required_error: 'botramGroupId harus diisi.',
      invalid_type_error: 'botramGroupId harus berupa string.',
    }),
  menu: z.object({
      isCustomMenu: z.boolean({
        required_error: 'isCustomMenu wajib diisi.',
        invalid_type_error: 'isCustomMenu harus berupa boolean.',
      }),
      id: z.string({
        required_error: 'id harus diisi.',
        invalid_type_error: 'id harus berupa string.',
      }),
    }, {
      required_error: 'menu wajib diisi.',
      invalid_type_error: 'menu harus berupa objek.'
    }),
  isDibungkus: z.boolean({
      required_error: 'isDibungkus harus diisi.',
      invalid_type_error: 'isDibungkus harus berupa boolean.',
    }),
  quantity: z.number({
      required_error: 'quantity harus diisi.',
      invalid_type_error: 'quantity harus berupa number.',
    }),
  spicyLevel: z.number({
      invalid_type_error: 'spicyLevel harus berupa number.'
    })
    .positive('spicyLevel harus bernilai lebih dari 0')
    .optional(),
});

type AddMenuToBotramCartBodyRequest = z.infer<typeof addMenuToBotramCartBodySchema>;

type GetItemsByBotramGroupResponse = {
  botramGroup: {
    id: BotramGroup['id'],
    name: BotramGroup['name'],
    restaurant: {
      id: Restaurant['id'],
      username: Restaurant['username'],
      name: Restaurant['name'],
    },
  },
  items: {
    menuCarts: {
      id: BotramGroupMenuCart['id'],
      menu: {
        id: Menu['id'],
        name: Menu['name'],
        price: Menu['price'],
      },
      isDibungkus: BotramGroupMenuCart['isDibungkus'],
      quantity: BotramGroupMenuCart['quantity'],
      spicyLevel: BotramMenuCartSpicyLevel['level'] | null,
    }[] | [],
    customMenuCarts: {
      id: BotramGroupCustomMenuCart['id'],
      customMenu: {
        id: CustomMenu['id'],
        name: CustomMenu['name'],
        price: CustomMenu['price'],
      },
      isDibungkus: BotramGroupCustomMenuCart['isDibungkus'],
      quantity: BotramGroupCustomMenuCart['quantity'],
      spicyLevel: BotramCustomMenuCartSpicyLevel['level'] | null,
    }[] | [],
  },
} | null;

type UpdateQtyOfBotramCartItemResponse = {
  botramCartId: MenuCart['id'] | CustomMenuCart['id'],
  isAvailableToAddMore: boolean,
}

const itemBulkDeletionBodySchema = z.object({
  itemIds: z.array(z.object({
      isCustomMenu: z.boolean({
          required_error: 'isCustomMenu harus diisi.',
          invalid_type_error: 'isCustomMenu harus berupa boolean.'
        }),
      id: z.string({
        required_error: 'id harus diisi.',
        invalid_type_error: 'id harus berupa string.'
      }),
    }), {
      required_error: 'itemIds harus diisi.',
      invalid_type_error: 'itemIds harus berupa array.',
    }).min(1, 'itemIds setidaknya memiliki 1 item'),
}); 

type ItemBulkDeletionBodyRequest = z.infer<typeof itemBulkDeletionBodySchema>;

export {
  GetBotramCartResponse,
  addMenuToBotramCartBodySchema,
  AddMenuToBotramCartBodyRequest,
  GetItemsByBotramGroupResponse,
  UpdateQtyOfBotramCartItemResponse,
  itemBulkDeletionBodySchema,
  ItemBulkDeletionBodyRequest,
};

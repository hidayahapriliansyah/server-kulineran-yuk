import { CustomMenu, CustomMenuCart, CustomMenuCartSpicyLevel, Menu, MenuCart, MenuCartSpicyLevel, Restaurant } from '@prisma/client';
import { GroupedCartByRestaurant } from '../cart/types';
import { boolean, z } from 'zod';

type GetMyCartResponse = {
  restaurantCount: number,
  cart: GroupedCartByRestaurant,
};

const addMenuToMyCartBodySchema = z.object({
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

type AddMenuToMyCartBodyRequest = z.infer<typeof addMenuToMyCartBodySchema>;

type GetItemsByRestaurantResponse = {
  restaurant: {
    id: Restaurant['id'],
    username: Restaurant['username'],
    name: Restaurant['name'],
  },
  items: {
    menuCarts: {
      id: MenuCart['id'],
      menu: {
        id: Menu['id'],
        name: Menu['name'],
        price: Menu['price'],
      },
      isDibungkus: MenuCart['isDibungkus'],
      quantity: MenuCart['quantity'],
      spicyLevel: MenuCartSpicyLevel['level'] | null,
    }[] | [],
    customMenuCarts: {
      id: CustomMenuCart['id'],
      menu: {
        id: CustomMenu['id'],
        name: CustomMenu['name'],
        price: CustomMenu['price'],
      },
      isDibungkus: CustomMenuCart['isDibungkus'],
      quantity: CustomMenuCart['quantity'],
      spicyLevel: CustomMenuCartSpicyLevel['level'] | null,
    }[] | [],
  },
};

type UpdateQtyOfMyCartItemResponse = {
  cartItemId: MenuCart['id'] | CustomMenuCart['id'],
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
  addMenuToMyCartBodySchema,
  AddMenuToMyCartBodyRequest,
  GroupedCartByRestaurant,
  GetMyCartResponse,
  GetItemsByRestaurantResponse,
  UpdateQtyOfMyCartItemResponse,
  itemBulkDeletionBodySchema,
  ItemBulkDeletionBodyRequest,
};

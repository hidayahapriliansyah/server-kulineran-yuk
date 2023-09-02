import {
  CustomMenu,
  CustomMenuCategory,
  CustomMenuComposition,
  PickedCustomMenuComposition,
  Restaurant
} from '@prisma/client';
import { z } from 'zod';

type CustomMenuResponse = {
  id: CustomMenu['id'];
  name: CustomMenu['name'];
  createdAt: CustomMenu['createdAt'];
  image: Restaurant['avatar'];
  restaurant: {
    id: Restaurant['id'];
    username: Restaurant['username'];
    name: Restaurant['name'];
  };
  customMenuCategory: {
    id: CustomMenuCategory['id'];
    name: CustomMenuCategory['name'];
    isBungkusAble: CustomMenuCategory['isBungkusAble'];
  };
  pickedCustomMenuCompositions: {
    id: PickedCustomMenuComposition['id'];
    customMenuComposition: {
      id: CustomMenuComposition['id'];
      image: CustomMenuComposition['image1'];
      name: CustomMenuComposition['name'];
      price: CustomMenuComposition['price'];
    };
    qty: PickedCustomMenuComposition['qty'];
  }[];
}

type GetAllCustomMenuResponse =
  Pick<CustomMenuResponse, 'id' | 'createdAt' | 'name' | 'image' | 'restaurant'>[] | [];

const createCustomMenuRequestBodySchema = z.object({
  restaurantId: z.string({
      required_error: 'restaurantId harus diisi.',
      invalid_type_error: 'restaurantId harus diisi dengan string.',
    }),
  customMenuCategoryId: z.string({
      required_error: 'customMenuCategoryId harus diisi.',
      invalid_type_error: 'customMenuCategoryId harus diisi dengan string.',
    }),
  name: z.string({
      required_error: 'Nama harus diisi.',
      invalid_type_error: 'Nama harus diisi dengan string.',
    })
    .nonempty('Nama minimal memiliki 1 karakter.')
    .max(80, 'Nama maksimal memiliki 80 karakter.'),
  pickedCustomMenuComposition: z.array(z.object({
      id: z.string({
          required_error: 'id composition harus diisi.',
          invalid_type_error: 'id composition harus diisi dengan string.',
        }),
      qty: z.number({
          required_error: 'Qty harus diisi.',
          invalid_type_error: 'Qty harus diisi dengan number.',
        })
        .min(1, 'Composisi yang dipilih setidaknya memiliki 1 qty.'),
    }), 
    {
      required_error: 'Composisi harus diisi.',
      invalid_type_error: 'Composisi harus berupa array.',
    })
    .nonempty('Custom menu setidaknya memiliki 1 komposisi.'),
});

const updateCustomMenuRequestBodySchema = 
  createCustomMenuRequestBodySchema.pick({
    name: true,
    pickedCustomMenuComposition: true,
  });

type CreateCustomMenuRequestBody = z.infer<typeof createCustomMenuRequestBodySchema>;
type UpdateCustomMenuRequestBody = z.infer<typeof updateCustomMenuRequestBodySchema>;

export {
  CustomMenuResponse,
  GetAllCustomMenuResponse,
  createCustomMenuRequestBodySchema,
  updateCustomMenuRequestBodySchema,
  UpdateCustomMenuRequestBody,
  CreateCustomMenuRequestBody,
};

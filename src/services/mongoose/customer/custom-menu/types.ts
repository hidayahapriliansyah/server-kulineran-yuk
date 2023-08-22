import { TypeOf, z } from 'zod';
import { ICustomMenu } from '../../../../models/CustomMenu'
import { ICustomMenuComposition } from '../../../../models/CustomMenuComposition';
import { IRestaurant } from '../../../../models/Restaurant';
import { ICustomMenuCategory } from '../../../../models/CustomMenuCategory';
import { IPickedCustomMenuCompositions } from '../../../../models/PickedCustomMenuComposition';

type CustomMenuResponse = {
  _id: ICustomMenu['_id'];
  name: ICustomMenu['name'];
  createdAt: ICustomMenu['createdAt'];
  image: IRestaurant['avatar'];
  restaurant: {
    _id: IRestaurant['_id'];
    username: IRestaurant['username'];
    name: IRestaurant['name'];
  };
  customMenuCategory: {
    _id: ICustomMenuCategory['_id'];
    name: ICustomMenuCategory['name'];
    isBungkusAble: ICustomMenuCategory['isBungkusAble'];
  };
  pickedCustomMenuCompositions: {
    _id: IPickedCustomMenuCompositions['_id'];
    customMenuComposition: {
      _id: ICustomMenuComposition['_id'];
      image: ICustomMenuComposition['image1'];
      name: ICustomMenuComposition['name'];
      price: ICustomMenuComposition['price'];
    };
    qty: IPickedCustomMenuCompositions['qty'];
  }[];
}

type GetAllCustomMenuResponse =
  Pick<CustomMenuResponse, '_id' | 'createdAt' | 'name' | 'image' | 'restaurant'>[] | [];

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
      _id: z.string({
          required_error: '_id composition harus diisi.',
          invalid_type_error: '_id composition harus diisi dengan string.',
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

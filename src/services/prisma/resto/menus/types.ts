import { Etalase, Menu } from '@prisma/client';
import { z } from 'zod';

const etalaseBodySchema = z.object({
  name: z.string({
      required_error: 'name harus diisi.',
      invalid_type_error: 'name harus berupa string.',
    })
    .nonempty('name minimal memiliki 1 karakter.')
    .max(20, 'name maksimal memiliki 20 karakter.'),
  });
const restaurantMenuBodySchema = z.object({
  name: z.string({
      required_error: 'name harus diisi.',
      invalid_type_error: 'name harus berupa string.',
    })
    .nonempty('name minimal memiliki 1 karakter.')
    .max(80, 'name maksimal memiliki 80 karakter.')
    .regex(/^[a-zA-Z0-9.'\s-]+$/, 'name harus berupa a-z A-Z 0-9 . \' -'),
  isBungkusAble: z.boolean({
      invalid_type_error: 'isBungkusAble harus berupa boolean.',
    })
    .default(false).optional(),
  description: z.string({
      required_error: 'description harus diisi.',
      invalid_type_error: 'description harus berupa string.',
    })
    .min(1, 'description minimal memiliki 1 karakter.')
    .max(3000, 'description maksimal memiliki 3000 karakter.'),
  etalaseId: z.string({
      required_error: 'etalaseId harus diisi.',
      invalid_type_error: 'etalaseId harus berupa string.',
    }),
  price: z.number({
      required_error: 'price harus diisi.',
      invalid_type_error: 'price harus berupa number.',
    })
    .positive('price harus bernilai positive.'),
  stock: z.number({
      invalid_type_error: 'stock harus berupa number.',
    }).optional(),
  // images: z.array(z.string().nullable()).min(1).max(5),
  images: z.array(z.string({
      required_error: 'item images harus diisi.',
      invalid_type_error: 'item images harus berupa string.',
    }), {
      required_error: 'images harus diisi.',
      invalid_type_error: 'images harus berupa array.',
    })
    .min(1, 'images minimal memiliki 1 item.')
    .max(5, 'image maksimal memiliki 5 item.'),
  maxSpicy: z.number({
      invalid_type_error: 'maxSpicy harus berupa number.',
    })
    .nullable()
    .default(null)
    .optional(),
});

type EtalaseResponse = Pick<Etalase, 'id' | 'name'>;

type EtalaseBody = z.infer<typeof etalaseBodySchema>;
type RestaurantMenuBody = z.infer<typeof restaurantMenuBodySchema>;
type RestaurantMenuResponse = Omit<RestaurantMenuBody, 'images'> & { id: Menu['id'], images: (string | null)[] };
type RestaurantMenuList = {
  id: RestaurantMenuResponse['id'];
  name: RestaurantMenuResponse['name'];
  isActive: Menu['isActive'];
  price: RestaurantMenuResponse['price'];
}[];
type GetMenusWithPaginated = { menus: RestaurantMenuList, pages: number, total: number };

export {
  etalaseBodySchema,
  restaurantMenuBodySchema,
  EtalaseBody,
  EtalaseResponse,
  RestaurantMenuBody,
  RestaurantMenuResponse,
  RestaurantMenuList,
  GetMenusWithPaginated,
};

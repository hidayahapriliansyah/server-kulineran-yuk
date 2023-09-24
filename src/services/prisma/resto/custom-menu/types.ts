import { CustomMenuCategory, CustomMenuComposition } from '@prisma/client';
import { z } from 'zod';

const customMenuCategoryBodySchema = z.object({
  name: z.string({
      required_error: 'name harus diisi.',
      invalid_type_error: 'name harus berupa string.',
    })
    .nonempty('name minimal memiliki 1 karakter.')
    .max(50, 'name maksimal memiliki 50 karakter.'),
  isBungkusAble: z.boolean({
      invalid_type_error: 'isBungkusAble harus berupa boolean',
    })
    .default(false)
    .optional(),
  maxSpicy: z.number({
      invalid_type_error: 'maxSpicy harus berupa boolean.',
    })
    .nullable()
    .default(null)
    .optional(),
});
type CustomMenuCategoryBody = z.infer<typeof customMenuCategoryBodySchema>;
type CustomMenuCategoryResponse = {
  id: CustomMenuCategory['id'];
  name: CustomMenuCategoryBody['name'];
  isBungkusAble: CustomMenuCategoryBody['isBungkusAble'];
  maxSpicy: CustomMenuCategoryBody['maxSpicy'];
};
const customMenuCompositionBodySchema = z.object({
  customMenuCategoryId: z.string({
      required_error: 'customMenuCategoryId harus diisi.',
      invalid_type_error: 'customMenuCategoryId harus berupa string.',
    }),
  name: z.string({
      required_error: 'name harus diisi.',
      invalid_type_error: 'name harus berupa string.',
    })
    .nonempty('name minimal memiliki 1 karakter.')
    .max(80, 'name maksimal memiliki 80 karakter.'),
  description: z.string({
      required_error: 'description harus diisi.',
      invalid_type_error: 'description harus berupa string.',
    })
    .nonempty('description minimal memiliki 1 karakter.')
    .max(3000, 'description maksimal memiliki 3000 karakter.'),
  price: z.number({
      required_error: 'price harus diisi.',
      invalid_type_error: 'price harus berupa number.',
    })
    .positive('price harus positive.'),
  images: z.array(z.string({
      required_error: 'item images harus diisi.',
      invalid_type_error: 'item images harus berupa string.',
    }), {
      required_error: 'images harus diisi.',
      invalid_type_error: 'images harus berupa array.',
    })
    .min(1, 'images minimal memiliki 1 item.')
    .max(2, 'image maksimal memiliki 2 item.'),
  stock: z.number({
      invalid_type_error: 'stock harus berupa number.',
    })
    .default(0)
    .optional(),
});
type CustomMenuCompositionBody = z.infer<typeof customMenuCompositionBodySchema>;
type CustomMenuCompositionResponse = {
  id: CustomMenuComposition['id'];
  customMenuCategoryId: CustomMenuCompositionBody['customMenuCategoryId'];
  name: CustomMenuCompositionBody['name'];
  description: CustomMenuCompositionBody['description'];
  price: CustomMenuCompositionBody['price'];
  stock: CustomMenuCompositionBody['stock'];
  images: (string | null)[];
};
type GetCustomMenuCompositionsWithPaginated = {
  customMenuCompositions: Pick<CustomMenuCompositionResponse, 'id' | 'name' | 'price'>[];
  pages: number;
  total: number;
};

export {
  customMenuCategoryBodySchema,
  CustomMenuCategoryBody,
  CustomMenuCategoryResponse,
  customMenuCompositionBodySchema,
  CustomMenuCompositionBody,
  CustomMenuCompositionResponse,
  GetCustomMenuCompositionsWithPaginated,
};

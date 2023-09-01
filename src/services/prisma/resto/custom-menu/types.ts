import { CustomMenuCategory, CustomMenuComposition } from '@prisma/client';
import { z } from 'zod';

const customMenuCategoryBodySchema = z.object({
  name: z.string().nonempty().max(50),
  isBungkusAble: z.boolean().default(false).optional(),
  maxSpicy: z.number().nullable().default(null).optional(),
});
type CustomMenuCategoryBody = z.infer<typeof customMenuCategoryBodySchema>;
type CustomMenuCategoryResponse = {
  id: CustomMenuCategory['id'];
  name: CustomMenuCategoryBody['name'];
  isBungkusAble: CustomMenuCategoryBody['isBungkusAble'];
  maxSpicy: CustomMenuCategoryBody['maxSpicy'];
};
const customMenuCompositionBodySchema = z.object({
  customMenuCategoryId: z.string(),
  name: z.string().nonempty().max(80),
  description: z.string().nonempty().max(3000),
  price: z.number().positive(),
  images: z.array(z.string().nullable()).min(1).max(2),
  stock: z.number().default(0).optional(),
});
type CustomMenuCompositionBody = z.infer<typeof customMenuCompositionBodySchema>;
type CustomMenuCompositionResponse = {
  id: CustomMenuComposition['id'];
  customMenuCategoryId: CustomMenuCompositionBody['customMenuCategoryId'];
  name: CustomMenuCompositionBody['name'];
  description: CustomMenuCompositionBody['description'];
  price: CustomMenuCompositionBody['price'];
  stock: CustomMenuCompositionBody['stock'];
  images: CustomMenuCompositionBody['images'];
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

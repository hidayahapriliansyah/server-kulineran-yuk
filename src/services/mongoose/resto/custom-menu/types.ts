import { z } from 'zod';
import { ICustomMenuCategory } from '../../../../models/CustomMenuCategory';
import { ICustomMenuComposition } from '../../../../models/CustomMenuComposition';

const customMenuCategoryBodySchema = z.object({
  name: z.string().nonempty().max(50),
  isBungkusAble: z.boolean().default(false).optional(),
  maxSpicy: z.number().nullable().default(null).optional(),
});
type CustomMenuCategoryBody = z.infer<typeof customMenuCategoryBodySchema>;
type CustomMenuCategoryResponse = {
  _id: ICustomMenuCategory['_id'];
  name: CustomMenuCategoryBody['name'];
  isBungkusAble: CustomMenuCategoryBody['isBungkusAble'];
  maxSpicy: CustomMenuCategoryBody['maxSpicy'];
};
const customMenuCompositionBodySchema = z.object({
  customMenuCategoryId: z.string(),
  name: z.string().nonempty().max(80),
  description: z.string().nonempty().max(3000),
  price: z.number().positive(),
  images: z.array(z.string()).min(1).max(2),
  stock: z.number().default(0).optional(),
});
type CustomMenuCompositionBody = z.infer<typeof customMenuCompositionBodySchema>;
type CustomMenuCompositionResponse = {
  _id: ICustomMenuComposition['_id'];
  customMenuCategoryId: CustomMenuCompositionBody['customMenuCategoryId'];
  name: CustomMenuCompositionBody['name'];
  description: CustomMenuCompositionBody['description'];
  price: CustomMenuCompositionBody['price'];
  stock: CustomMenuCompositionBody['stock'];
  images: CustomMenuCompositionBody['images'];
};
type GetCustomMenuCompositionsWithPaginated = {
  customMenuCompositions: Pick<CustomMenuCompositionResponse, '_id' | 'name' | 'price'>[];
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

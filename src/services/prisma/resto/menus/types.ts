import { Etalase, Menu } from '@prisma/client';
import { z } from 'zod';

const etalaseBodySchema = z.object({
  name: z.string().nonempty().max(20),
});
const restaurantMenuBodySchema = z.object({
  name: z.string().nonempty().min(1).max(80).regex(/^[a-zA-Z0-9.'\s-]+$/),
  isBungkusAble: z.boolean().default(false).optional(),
  description: z.string().min(1).max(3000),
  etalaseId: z.string(),
  price: z.number().positive(),
  stock: z.number().optional(),
  images: z.array(z.string().nullable()).min(1).max(5),
  maxSpicy: z.number().nullable().default(null).optional(),
});

type EtalaseResponse = Pick<Etalase, 'id' | 'name'>;

type EtalaseBody = z.infer<typeof etalaseBodySchema>;
type RestaurantMenuBody = z.infer<typeof restaurantMenuBodySchema>;
type RestaurantMenuResponse = RestaurantMenuBody & { id: Menu['id'] };
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

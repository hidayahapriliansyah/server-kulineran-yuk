import { ObjectId } from 'mongoose';
import { z } from 'zod';
import { IMenu } from '../../../../models/Menu';

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
  images: z.array(z.string()).min(1).max(5),
  maxSpicy: z.number().nullable().default(null).optional(),
});

type EtalaseResponse = {
  _id: ObjectId;
  name: string;
}
type EtalaseBody = z.infer<typeof etalaseBodySchema>;
type RestaurantMenuBody = z.infer<typeof restaurantMenuBodySchema>;
type RestaurantMenuResponse = RestaurantMenuBody & { _id: IMenu['_id'] };
type RestaurantMenuList = {
  _id: RestaurantMenuResponse['_id'];
  name: RestaurantMenuResponse['name'];
  isActive: IMenu['isActive'];
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

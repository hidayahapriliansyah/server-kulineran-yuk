import { z } from 'zod';
import { IRestaurant } from '../../../../models/Restaurant';
import { IMenu } from '../../../../models/Menu';
import { IRestaurantReview } from '../../../../models/RestaurantReview';
import { ICustomer } from '../../../../models/Customer';

type FindRestaurantResponse = Pick<RestaurantProfileResponse, '_id' | 'avatar' | 'username' | 'name'>;
type RestaurantProfileResponse = {
  _id: IRestaurant['_id'],
  avatar: IRestaurant['avatar'],
  username: IRestaurant['username'],
  name: IRestaurant['name'],
  isOpenNow: boolean,
  gallery: string[],
  detail: {
    address: string | null,
    contact: string | null,
    openingHour: string | null,
    closingHour: string | null,
    daysOff: string[] | [],
  },
  fasilities: string[],
  locationLink: string,
}
type GetAllRestaurantMenusResponse = {
  menus: {
    _id: IMenu['_id'];
    slug: IMenu['slug'];
    image: IMenu['image1'];
    name: IMenu['name'];
    price: IMenu['price'];
  }[] | [];
  pages: number;
  total: number;
}
type RestaurantReviewsResponse = {
  _id: IRestaurantReview['_id'];
  createdAt: IRestaurantReview['createdAt'];
  rating: IRestaurantReview['rating'];
  description: IRestaurantReview['reviewDescription'];
  reviewer: {
    username: ICustomer['username'];
    name: ICustomer['name'];
    everShoppingHere: IRestaurantReview['hasCustomerBeenShoppingHere'];
  };
}
type GetAllRestaurantReviewsResponse = {
  userReview: RestaurantReviewsResponse | null, 
  reviews: RestaurantReviewsResponse[] | [];
  pages: number;
  total: number;
}
const restaurantReviewBodySchema = z.object({
  rating: z.string({
      required_error: 'Rating harus diisi.',
      invalid_type_error: 'Rating harus diisi nilai 1, 2, 3, 4, atau 5.',
    }).refine((value) => ['1', '2', '3', '4', '5'].includes(value), {
      message: 'Rating harus diisi nilai 1, 2, 3, 4, atau 5.',
    }),
  description: z.string({
      required_error: 'Deskripsi harus diisi.',
      invalid_type_error: 'Deskripsi harus diisi berupa string.',
    })
    .max(250, 'Deskripsi maksimal memiliki 250 karakter.'),
});
type RestaurantReviewBody = z.infer<typeof restaurantReviewBodySchema>;

export {
  FindRestaurantResponse,
  RestaurantProfileResponse,
  RestaurantReviewsResponse,
  GetAllRestaurantMenusResponse,
  GetAllRestaurantReviewsResponse,
  restaurantReviewBodySchema,
  RestaurantReviewBody,
};

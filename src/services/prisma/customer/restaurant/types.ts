import { Customer, Menu, Restaurant, RestaurantReview } from '@prisma/client';
import { z } from 'zod';

type FindRestaurantResponse = Pick<RestaurantProfileResponse, 'id' | 'avatar' | 'username' | 'name'>;
type RestaurantProfileResponse = {
  id: Restaurant['id'],
  avatar: Restaurant['avatar'],
  username: Restaurant['username'],
  name: Restaurant['name'],
  isOpenNow: boolean | null,
  gallery: (string | null)[],
  detail: {
    address: string | null,
    contact: string | null,
    openingHour: string | null,
    closingHour: string | null,
    daysOff: string[] | [],
  },
  fasilities: string[],
  locationLink: string | null,
}
type GetAllRestaurantMenusResponse = {
  menus: {
    id: Menu['id'];
    slug: Menu['slug'];
    image: Menu['image1'];
    name: Menu['name'];
    price: Menu['price'];
  }[] | [];
  pages: number;
  total: number;
}
type RestaurantReviewsResponse = {
  id: RestaurantReview['id'];
  createdAt: RestaurantReview['createdAt'];
  rating: RestaurantReview['rating'];
  description: RestaurantReview['reviewDescription'];
  reviewer: {
    username: Customer['username'];
    name: Customer['name'];
    everShoppingHere: RestaurantReview['hasCustomerBeenShoppingHere'];
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

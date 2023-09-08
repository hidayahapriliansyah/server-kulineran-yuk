import { Customer, RestaurantReview, RestaurantReviewResponse } from '@prisma/client'
import { z } from 'zod';

type ReviewItemResponse = {
  id: RestaurantReview['id'],
  createdAt: RestaurantReview['createdAt'],
  customer: {
    username: Customer['username'],
  },
  rating: RestaurantReview['rating'],
  reviewDescription: RestaurantReview['reviewDescription'],
};

type GetAllRestaurantReviewsResponse = {
  reviews: ReviewItemResponse[] | [],
  page: number,
  total: number,
};

type GetDetailReviewByIdResponse = {
  id: RestaurantReview['id'],
  createdAt: RestaurantReview['createdAt'],
  customer: {
    username: Customer['username'],
    name: Customer['name'],
  },
  rating: RestaurantReview['rating'],
  hasCustomerBeenShoppingHere: RestaurantReview['hasCustomerBeenShoppingHere'],
  reviewDescription: RestaurantReview['reviewDescription'],
  isReplied: RestaurantReview['isReplied'],
  restaurantReviewResponse: {
    id: RestaurantReviewResponse['id'],		
    createdAt: RestaurantReviewResponse['createdAt'],
    updatedAt: RestaurantReviewResponse['updatedAt'],
    responseDescription: RestaurantReviewResponse['responseDescription'],
  } | null,
}

const createUpdateReviewResponseBodySchema = z.object({
  responseDescription: z.string({
      required_error: 'Deskripsi harus diisi.',
      invalid_type_error: 'Deskripsi haru berupa string.',
    })
    .nonempty('Deskripsi harus memiliki setidaknya 1 karakter.')
    .max(250, 'Deskripsi maksimal memiliki 250 karakter.'),
});

type CreateUpdateReviewResponseBody = z.infer<typeof createUpdateReviewResponseBodySchema>;

export {
  ReviewItemResponse,
  GetAllRestaurantReviewsResponse,
  GetDetailReviewByIdResponse,
  createUpdateReviewResponseBodySchema,
  CreateUpdateReviewResponseBody,
};

import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { ICustomer } from '../customers/model';
import { IRestaurant } from '../restaurants/model';

export interface IRestaurantReview extends TimestampsDocument {
  customerId: ICustomer['_id'];
  restaurantId: IRestaurant['_id'];
  hasCustomerBeenShoppingHere: boolean;
  reviewDescription: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

const restaurantReviewSchema = new Schema<IRestaurantReview>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    hasCustomerBeenShoppingHere: {
      type: Boolean,
      default: false,
    },
    reviewDescription: {
      type: String,
      maxlength: [500, 'Ulasan maksimal memiliki 500 karakter'],
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const RestaurantReview: Model<IRestaurantReview> =
  models.RestaurantReview || model('RestaurantReview', restaurantReviewSchema);

export default RestaurantReview;

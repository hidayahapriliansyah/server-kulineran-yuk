import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { ICustomer } from './Customer';
import { IRestaurant } from './Restaurant';

export interface IRestaurantReview extends TimestampsDocument {
  customerId: ICustomer['_id'] | ICustomer;
  restaurantId: IRestaurant['_id'];
  hasCustomerBeenShoppingHere: boolean;
  reviewDescription: string;
  rating: 1 | 2 | 3 | 4 | 5;
  isReplied: boolean;
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
      maxlength: [250, 'Ulasan maksimal memiliki 250 karakter'],
    },
    rating: {
      type: Number,
      required: true,
    },
    isReplied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const RestaurantReview: Model<IRestaurantReview> =
  models.RestaurantReview || model('RestaurantReview', restaurantReviewSchema);

export default RestaurantReview;

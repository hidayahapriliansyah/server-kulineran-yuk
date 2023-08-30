import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { IRestaurantReview } from './RestaurantReview';
import { IRestaurant } from './Restaurant';

interface IRestaurantReviewResponse extends TimestampsDocument {
  restaurantReviewId: IRestaurantReview['_id'];
  restaurantId: IRestaurant['_id'];
  responseDescription: string;
}

const restaurantReviewResponseSchema = new Schema<IRestaurantReviewResponse>({
  restaurantReviewId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'RestaurantReview',
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant',
  },
  responseDescription: {
    type: String,
    required: [true, 'Balasan harus diisi'],
    minlength: [1, 'Balasana minimal memiliki 1 karakter'],
    maxlength: [250, 'Balasana minimal memiliki 250 karakter'],
  },
}, { timestamps: true });
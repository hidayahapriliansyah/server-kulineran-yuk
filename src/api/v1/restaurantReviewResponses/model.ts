import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { IRestaurantReview } from '../restaurantReviews/model';
import { IRestaurant } from '../restaurants/model';

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
    maxlength: [150, 'Balasana minimal memiliki 150 karakter'],
  },
}, { timestamps: true });
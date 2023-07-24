import { Schema, Model, model, models } from 'mongoose';
import { IRestaurant } from './Restaurant';
import { TimestampsDocument } from '../global/types';

interface IRestaurantResetPasswordRequest extends TimestampsDocument {
  restaurantId: IRestaurant['_id'];
  uniqueString: string;
  expiredAt: Date;
}

const restauranResetPasswordRequestSchema =
  new Schema<IRestaurantResetPasswordRequest>(
    {
      restaurantId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Restaurant',
      },
      uniqueString: {
        type: String,
        required: true,
      },
      expiredAt: {
        type: Date,
        required: true,
      },
    },
    { timestamps: true }
  );

const RestaurantResetPasswordRequest: Model<IRestaurantResetPasswordRequest> =
  models.RestaurantResetPasswordRequest ||
  model('RestaurantResetPasswordRequest', restauranResetPasswordRequestSchema);

export default RestaurantResetPasswordRequest;

import { Schema, Model, model, models } from 'mongoose';
import { IRestaurant } from './Restaurant';
import { TimestampsDocument } from '../global/types';

interface IRestaurantVerification extends TimestampsDocument {
  restaurantId: IRestaurant['_id'];
  email: string;
  uniqueString: string;
  expiredAt: Date;
}

const restaurantVerificationSchema = new Schema<IRestaurantVerification>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    email: {
      type: String,
    },
    uniqueString: {
      type: String,
    },
    expiredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const RestaurantVerification: Model<IRestaurantVerification> =
  models.RestaurantVerification ||
  model('RestaurantVerification', restaurantVerificationSchema);

export default RestaurantVerification;

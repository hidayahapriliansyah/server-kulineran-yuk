import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { IRestaurant } from './Restaurant';

export interface IRestaurantNotification extends TimestampsDocument {
  restaurantId: IRestaurant['_id'];
  redirectLink: string;
  title: string;
  description: string;
  isRead: boolean;
}

const restaurantNotificationSchema = new Schema<IRestaurantNotification>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    redirectLink: {
      type: String,
      required: [true, 'RedirectLink notifikasi harus diisi'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const RestaurantNotification: Model<IRestaurantNotification> =
  models.RestaurantNotification || model('RestaurantNotification', restaurantNotificationSchema);

export default RestaurantNotification;

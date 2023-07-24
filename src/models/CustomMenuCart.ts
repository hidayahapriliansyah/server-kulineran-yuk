import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { ICustomer } from './Customer';
import { IRestaurant } from './Restaurant';
import { ICustomMenu } from './CustomMenu';

export interface ICustomMenuCart extends TimestampsDocument {
  customerId: ICustomer['_id'];
  restaurantId: IRestaurant['_id'];
  customMenuId: ICustomMenu['_id'];
  quantity: number;
  isDibungkus: boolean;
}

const customMenuCartSchema = new Schema<ICustomMenuCart>(
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
    customMenuId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'CustomMenu',
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Item yang dimasukkan minimal 1 item'],
    },
    isDibungkus: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const CustomMenuCart: Model<ICustomMenuCart> =
  models.CustomMenuCart || model('CustomMenuCart', customMenuCartSchema);

export default CustomMenuCart;

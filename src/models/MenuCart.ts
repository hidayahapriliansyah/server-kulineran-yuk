import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { ICustomer } from './Customer';
import { IRestaurant } from './Restaurant';
import { IMenu } from './Menu';

export interface IMenuCart extends TimestampsDocument {
  customerId: ICustomer['_id'];
  restaurantId: IRestaurant['_id'];
  menuId: IMenu['_id'];
  quantity: number;
  isDibungkus: boolean;
}

const menuCartSchema = new Schema<IMenuCart>(
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
    menuId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Menu',
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

const MenuCart: Model<IMenuCart> =
  models.MenuCart || model('MenuCart', menuCartSchema);

export default MenuCart;

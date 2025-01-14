import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { ICustomer } from './Customer';
import { IRestaurant } from './Restaurant';
import { ICustomMenuCategory } from './CustomMenuCategory';

export interface ICustomMenu extends TimestampsDocument {
  customerId: ICustomer['_id'];
  restaurantId: IRestaurant['_id'] | IRestaurant;
  customMenuCategoryId: ICustomMenuCategory['_id'] | ICustomMenuCategory;
  name: string;
  price: number;
}

const customMenuSchema = new Schema<ICustomMenu>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    customMenuCategoryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'CustomMenuCategory',
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    name: {
      type: String,
      required: [true, 'Nama custom menu harus diisi'],
      minlength: [1, 'Nama custom menu minimal memiliki 1 karakter'],
      maxlength: [80, 'Nama custom menu maksimal memiliki 80 karakter'],
    },
    price: {
      type: Number,
      required: [true, 'Harga menu harus diisi'],
    },
  },
  { timestamps: true }
);

const CustomMenu: Model<ICustomMenu> =
  models.CustomMenu || model('CustomMenu', customMenuSchema);

export default CustomMenu;

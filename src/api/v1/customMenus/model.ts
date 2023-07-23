import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { ICustomer } from '../customers/model';
import { IRestaurant } from '../restaurants/model';
import { ICustomMenuCategory } from '../customMenuCategories/model';

export interface ICustomMenu extends TimestampsDocument {
  customerId: ICustomer['_id'];
  restaurantId: IRestaurant['_id'];
  customMenuCategorId: ICustomMenuCategory['_id'];
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
    customMenuCategorId: {
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

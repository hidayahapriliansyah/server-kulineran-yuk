import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { ICustomer } from './Customer';
import { IMenu } from './Menu';

export interface IWishlist extends TimestampsDocument {
  customerId: ICustomer['_id'] | ICustomer;
  menuId: IMenu['_id'] | IMenu;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'CustomerId',
    },
    menuId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Menu',
    },
  },
  { timestamps: true }
);

const Wishlist: Model<IWishlist> =
  models.Wishlist || model('Wishlist', wishlistSchema);

export default Wishlist;

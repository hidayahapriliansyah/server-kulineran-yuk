import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { ICustomer } from '../customers/model';
import { IMenu } from '../menus/model';

interface IWishlist extends TimestampsDocument {
  customerId: ICustomer['_id'];
  menuId: IMenu['_id'];
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

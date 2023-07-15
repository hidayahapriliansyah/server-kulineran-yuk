import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { IOrder } from '../orders/model';
import { IMenu } from '../menus/model';

export interface IOrderedMenu extends TimestampsDocument {
  orderId: IOrder['_id'];
  menuId: IMenu['_id'];
  menuName: string;
  menuPrice: number;
  quantity: number;
  totalPrice: number;
  isDibungkus: boolean;
}

const orderedMenuSchema = new Schema<IOrderedMenu>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    menuId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Menu',
    },
    menuName: {
      type: String,
      required: true,
    },
    menuPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isDibungkus: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const OrderedMenu: Model<IOrderedMenu> =
  models.OrderedMenu || model('OrderedMenu', orderedMenuSchema);

export default OrderedMenu;

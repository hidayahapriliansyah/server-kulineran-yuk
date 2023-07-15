import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { IOrder } from '../orders/model';
import { ICustomMenu } from '../customMenus/model';

export interface IOrderedCustomMenu extends TimestampsDocument {
  orderId: IOrder['_id'];
  customMenuId: ICustomMenu['_id'];
  customMenuName: string;
  customMenuPrice: number;
  quantity: number;
  totalPrice: number;
  isDibungkus: boolean;
}

const orderedCustomMenuSchema = new Schema<IOrderedCustomMenu>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    customMenuId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'CustomMenu',
    },
    customMenuName: {
      type: String,
      required: true,
    },
    customMenuPrice: {
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

const OrderedCustomMenu: Model<IOrderedCustomMenu> =
  models.OrderedCustomMenu || model('OrderedCustomMenu', orderedCustomMenuSchema);

export default OrderedCustomMenu;

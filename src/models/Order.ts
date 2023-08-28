import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { ICustomer } from './Customer';
import { IRestaurant } from './Restaurant';

enum OrderStatus {
  READYTOORDER = 'readytoorder',
  ACCEPTED = 'accepted',
  PROCESSED = 'processed',
  DONE = 'done',
  CANCEL = 'cancel',
}

export interface IOrder extends TimestampsDocument {
  customerId: ICustomer['_id'];
  restaurantId: IRestaurant['_id'];
  isGroup: boolean;
  customerNote: string;
  total: number;
  status: OrderStatus;
  isAcceptedByCustomer: boolean;
  isPaid: boolean;
}

const orderSchema = new Schema<IOrder>({
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
  isGroup: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    required: [true, 'Total order harus diisi'],
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.READYTOORDER,
  },
  isAcceptedByCustomer: {
    type: Boolean,
    default: false,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  customerNote: {
    type: String,
    maxlength: [150, 'Catatan maksimal memiliki 150 karakter'],
  },
}, { timestamps: true });

const Order: Model<IOrder> = models.Order || model('Order', orderSchema);

export default Order;

import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { ICustomer } from './Customer';

interface ICustomerNotification extends TimestampsDocument {
  customerId: ICustomer['_id'];
  title: string;
  description: string;
  redirectLink: string;
  isRead: boolean;
}

const customerNotificationSchema = new Schema<ICustomerNotification>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
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

const CustomerNotification: Model<ICustomerNotification> =
  models.CustomerNotification || model('CustomerNotification', customerNotificationSchema);

export default CustomerNotification;

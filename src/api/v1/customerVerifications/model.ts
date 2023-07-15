import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { ICustomer } from '../customers/model';

interface ICustomerVerification extends TimestampsDocument {
  customerId: ICustomer['_id'];
  email: string;
  uniqueString: string;
  expiredAt: Date;
}

const customerVerificationSchema = new Schema<ICustomerVerification>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    email: {
      type: String,
    },
    uniqueString: {
      type: String,
    },
    expiredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const CustomerVerification: Model<ICustomerVerification> =
  models.CustomerVerification ||
  model('customerVerification', customerVerificationSchema);

export default CustomerVerification;

import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { ICustomer } from './Customer';

interface ICustomerResetPasswordRequest extends TimestampsDocument {
  customerId: ICustomer['_id'];
  uniqueString: string;
  expiredAt: Date;
}

const customerResetPasswordRequestSchema =
  new Schema<ICustomerResetPasswordRequest>(
    {
      customerId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Customer',
      },
      uniqueString: {
        type: String,
        required: true,
      },
      expiredAt: {
        type: Date,
        required: true,
      },
    },
    { timestamps: true }
  );

const CustomerResetPasswordRequest: Model<ICustomerResetPasswordRequest> =
  models.CustomerResetPasswordRequest ||
  model('CustomerResetPasswordRequest', customerResetPasswordRequestSchema);

export default CustomerResetPasswordRequest;

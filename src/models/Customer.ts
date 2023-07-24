import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';

enum joinBotramSetting {
  DIRECTLY = 'directly',
  INVITATION = 'invitation',
  BYSELF = 'byself',
}

export interface ICustomer extends TimestampsDocument {
  name: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  isVerified: boolean;
  joinBotram: joinBotramSetting;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: [true, 'Nama harus diisi'],
      minlength: [2, 'Nama minimal memiliki 2 karakter'],
      maxlength: [30, 'Nama minimal maksimal 30 karakter'],
    },
    username: {
      type: String,
      unique: true,
      required: [true, 'Username harus diisi'],
      minlength: [3, 'Username minimal memiliki 3 karakter'],
      maxlength: [30, 'Username minimal memiliki 30 karakter'],
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Email harus diisi'],
      maxlength: [254, 'Email maksimal memiliki 254 karakter'],
    },
    password: {
      type: String,
      minlength: [6, 'Password minimal memiliki 6 karakter'],
    },
    avatar: {
      type: String,
      default: 'customer-avatar.jpg',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    joinBotram: {
      type: String,
      default: joinBotramSetting.INVITATION,
    },
  },
  { timestamps: true }
);

const Customer: Model<ICustomer> = models.Customer || model('Customer', customerSchema);

export default Customer;

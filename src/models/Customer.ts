import { Schema, Model, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';
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
  comparePassword(inputtedPassword: string): Promise<boolean>;
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

customerSchema.pre('save', async function(next) {
  const Restaurant = this as ICustomer;
  if (Restaurant.isModified('password')) {
    Restaurant.password = await bcrypt.hash(Restaurant.password, 12);
  }
  next();
});

customerSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as { password: string };
  if (update!.password) {
    update.password = await bcrypt.hash(update.password, 12);
  }
  next();
});

customerSchema.methods.comparePassword = 
  async function(inputtedPassword: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(inputtedPassword, this.password);
    return isMatch;
  };

const Customer: Model<ICustomer> =
  models.Customer || model('Customer', customerSchema);

export default Customer;

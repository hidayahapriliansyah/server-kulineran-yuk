import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import bcrypt from 'bcryptjs';

enum CustomerPaymentType {
  AFTERORDER = 'afterorder',
  BEFOREORDER = 'beforeorder',
}

export interface IRestaurant extends TimestampsDocument {
  name: string;
  username: string;
  email: string;
  password: string;
  passMinimumProfileSetting: boolean;
  avatar: string;
  isVerified: boolean;
  customerPayment: CustomerPaymentType;
  locationLink: string;
  contact: string;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  image5: string;
  openingHour: string;
  closingHour: string;
  daysOff: string[];
  fasilities: string[];
  comparePassword(inputtedPassword: string): Promise<boolean>;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, 'Nama restoran harus diisi'],
      minlength: [3, 'Nama restoran minimal memiliki 3 karakter'],
      maxlength: [50, 'Nama restoran maximal memiliki 50 karakter'],
    },
    username: {
      type: String,
      required: [true, 'Username harus diisi'],
      unique: true,
      minlength: [3, 'Username restoran minimal memiliki 3 karakter'],
      maxlengt: [30, 'Username restoran maximal memiliki 30 karakter'],
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
    passMinimumProfileSetting: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: 'restaurant-avatar.jpg',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    customerPayment: {
      type: String,
      enum: Object.values(CustomerPaymentType),
      default: CustomerPaymentType.BEFOREORDER,
    },
    locationLink: {
      type: String,
    },
    contact: {
      type: String,
      maxlength: [14, 'Nomor kontak maksimal memiliki 14 karakter'],
    },
    image1: {
      type: String,
    },
    image2: {
      type: String,
    },
    image3: {
      type: String,
    },
    image4: {
      type: String,
    },
    image5: {
      type: String,
    },
    openingHour: {
      type: String,
    },
    closingHour: {
      type: String,
    },
    daysOff: {
      type: [String],
      default: [],
    },
    fasilities: {
      type: [String],
      default: [],
      maxlength: 50,
    },
  },
  { timestamps: true }
);

restaurantSchema.pre('save', async function(next) {
  const Restaurant = this as IRestaurant;
  if (Restaurant.isModified('password')) {
    Restaurant.password = await bcrypt.hash(Restaurant.password, 12);
  }
  next();
});

restaurantSchema.methods.comparePassword = 
  async function(inputtedPassword: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(inputtedPassword, this.password);
    return isMatch;
  };

const Restaurant: Model<IRestaurant> = models.Restaurant || model('Restaurant', restaurantSchema);

export default Restaurant;

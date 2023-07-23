import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';

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
  openingHour: Date;
  closingHour: Date;
  daysOff: string[];
  fasilities: string[];
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
      type: Date,
    },
    closingHour: {
      type: Date,
    },
    daysOff: {
      type: [String],
    },
    fasilities: {
      type: [String],
      maxlength: 50,
    },
  },
  { timestamps: true }
);

const Restaurant: Model<IRestaurant> = models.Restaurant || model('Restauran', restaurantSchema);

export default Restaurant;

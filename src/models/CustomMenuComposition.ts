import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { ICustomMenuCategory } from './CustomMenuCategory';
import { IRestaurant } from './Restaurant';

export interface ICustomMenuComposition extends TimestampsDocument {
  restaurantId: IRestaurant['_id'];
  customMenuCategoryId: ICustomMenuCategory['_id'];
  name: string;
  description: string;
  stock: number;
  price: number;
  image1: string;
  image2: string;
}

const customMenuCompositionSchema = new Schema<ICustomMenuComposition>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    customMenuCategoryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'CustomMenuCategory',
    },
    name: {
      type: String,
      required: [true, 'Nama komposisi harus diisi'],
      minlength: [1, 'Nama komposisi minimal memiliki 1 karakter'],
      maxlength: [80, 'Nama komposisi maksimal memiliki 80 karakter'],
    },
    description: {
      type: String,
      required: [true, 'Deskripsi menu harus diisi'],
      minlength: [1, 'Deskripsi menu minimal memiliki 1 karakter'],
      maxlength: [1000, 'Deskripsi menu maksimal memiliki 1000 karakter'],
    },
    stock: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Harga menu harus diisi'],
    },
    image1: {
      type: String,
      required: [true, 'Komposisi harus diberi minimal 1 gambar'],
    },
    image2: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const CustomMenuComposition: Model<ICustomMenuComposition> =
  models.CustomMenuComposition || model('CustomMenuComposition', customMenuCompositionSchema);

export default CustomMenuComposition;

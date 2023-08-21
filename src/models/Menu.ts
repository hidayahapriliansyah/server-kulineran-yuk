import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { IRestaurant } from './Restaurant';
import { IEtalase } from './Etalase';

export interface IMenu extends TimestampsDocument {
  restaurantId: IRestaurant['_id'] | IRestaurant;
  name: string;
  isBungkusAble: boolean;
  slug: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  image5: string;
  etalaseId: IEtalase['_id'];
}

const menuSchema = new Schema<IMenu>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    name: {
      type: String,
      required: [true, 'Nama menu harus diisi'],
      minlength: [1, 'Nama menu minimal memiliki 1 karakter'],
      maxlength: [80, 'Nama menu maksimal memiliki 80 karakter'],
    },
    isBungkusAble: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      unique: true,
      required: [true, 'Slug is required']
    },
    description: {
      type: String,
      required: [true, 'Deskripsi menu harus diisi'],
      minlength: [1, 'Deskripsi menu minimal memiliki 1 karakter'],
      maxlength: [3000, 'Deskripsi menu maksimal memiliki 3000 karakter'],
    },
    price: {
      type: Number,
      required: [true, 'Harga menu harus diisi'],
    },
    stock: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image1: {
      type: String,
      required: [true, 'Menu harus diberi minimal 1 gambar'],
    },
    image2: {
      type: String,
      default: '',
    },
    image3: {
      type: String,
      default: '',
    },
    image4: {
      type: String,
      default: '',
    },
    image5: {
      type: String,
      default: '',
    },
    etalaseId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Menu harus dimasukkan ke salah satu etalase'],
      ref: 'Etalase',
    },
  },
  { timestamps: true }
);

const Menu: Model<IMenu> = models.Menu || model('Menu', menuSchema); 

export default Menu;

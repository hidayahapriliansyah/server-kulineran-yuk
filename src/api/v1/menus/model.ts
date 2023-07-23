import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { IRestaurant } from '../restaurants/model';
import { IEtalase } from '../etalases/model';

export interface IMenu extends TimestampsDocument {
  restaurantId: IRestaurant['_id'];
  name: string;
  isBungkusAble: boolean;
  slug: string;
  descripttion: string;
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
    descripttion: {
      type: String,
      required: [true, 'Deskripsi menu harus diisi'],
      minlength: [50, 'Deskripsi menu minimal memiliki 50 karakter'],
      maxlength: [999, 'Deskripsi menu maksimal memiliki 999 karakter'],
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

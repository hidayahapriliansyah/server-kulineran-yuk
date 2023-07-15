import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { IRestaurant } from '../restaurants/model';

export interface ICustomMenuCategory extends TimestampsDocument {
  restaurantId: IRestaurant['_id'];
  name: string;
}

const customMenuCategorySchema = new Schema<ICustomMenuCategory>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    name: {
      type: String,
      required: [true, 'Nama kategori custom menu harus diisi'],
      minlength: [3, 'Nama kategori custom menu minimal memiliki 3 karakter'],
      maxlength: [
        50,
        'Nama kategori custom menu maksimal memiliki 50 karakter',
      ],
    },
  },
  { timestamps: true }
);

const CustomMenuCategory: Model<ICustomMenuCategory> =
  models.CustomMenuCategory ||
  model('CustomMenuCategory', customMenuCategorySchema);

export default CustomMenuCategory;

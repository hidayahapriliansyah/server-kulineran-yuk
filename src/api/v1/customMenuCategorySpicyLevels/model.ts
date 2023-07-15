import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { ICustomMenuCategory } from '../customMenuCategories/model';

interface ICustomMenuCategorySpicyLevel extends TimestampsDocument {
  customMenuCategoryId: ICustomMenuCategory['_id'];
  maxSpicy: number;
}

const CustomMenuCategorySpicyLevelSchema =
  new Schema<ICustomMenuCategorySpicyLevel>(
    {
      customMenuCategoryId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'CustomMenuCategory',
      },
      maxSpicy: {
        type: Number,
        required: [true, 'Level maksimal harus diisi'],
      },
    },
    { timestamps: true }
  );

const CustomMenuCategorySpicyLevel: Model<ICustomMenuCategorySpicyLevel> =
  models.CustomMenuCategorySpicyLevel || model('CustomMenuCategorySpicyLevel', CustomMenuCategorySpicyLevelSchema);

export default CustomMenuCategorySpicyLevel;

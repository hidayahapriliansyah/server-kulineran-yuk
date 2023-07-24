import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { IMenu } from './Menu';

interface IMenuSpicyLevel extends TimestampsDocument {
  menuId: IMenu['_id'];
  maxSpicy: number;
}

const menuSpicyLevelSchema = new Schema<IMenuSpicyLevel>(
  {
    menuId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Menu',
    },
    maxSpicy: {
      type: Number,
      required: [true, 'Level maksimal harus diisi'],
    },
  },
  { timestamps: true }
);

const MenuSpicyLevel: Model<IMenu> = models.MenuSpicyLevel || model('MenuSpicyLevel', menuSpicyLevelSchema);

export default MenuSpicyLevel;

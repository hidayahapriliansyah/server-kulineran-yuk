import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { IMenuCart } from '../menuCarts/model';

interface IMenuCartSpicyLevel extends TimestampsDocument {
  menuCartId: IMenuCart['_id'];
  level: number;
}

const menuCartSpicyLevelSchema = new Schema<IMenuCartSpicyLevel>(
  {
    menuCartId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'MenuCart',
    },
    level: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const MenuCartSpicyLevel: Model<IMenuCartSpicyLevel> =
  models.MenuCartSpicyLevel || model('MenuCartSpicyLevel', menuCartSpicyLevelSchema);

export default MenuCartSpicyLevel;

import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { ICustomMenuCart } from '../customMenuCarts/model';

interface ICustomMenuCartSpicyLevel extends TimestampsDocument {
  customMenuCartId: ICustomMenuCart['_id'];
  level: number;
}

const customMenuCartSpicyLevelSchema = new Schema<ICustomMenuCartSpicyLevel>(
  {
    customMenuCartId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'CustomMenuCart',
    },
    level: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const CustomMenuCartSpicyLevel: Model<ICustomMenuCartSpicyLevel> =
  models.CustomMenuCartSpicyLevel || model('CustomMenuCartSpicyLevel', customMenuCartSpicyLevelSchema);

export default CustomMenuCartSpicyLevel;

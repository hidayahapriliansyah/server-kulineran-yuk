import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { IOrderedMenu } from './OrderedMenu';

export interface IOrderedMenuSpicyLevel extends TimestampsDocument {
  orderedMenuId: IOrderedMenu['_id'];
  level: number;
}

const orderedMenuSpicyLevelSchema = new Schema<IOrderedMenuSpicyLevel>(
  {
    orderedMenuId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'OrderedMenu',
    },
    level: {
      type: Number,
      required: [true, 'Level maksimal harus diisi'],
    },
  },
  { timestamps: true }
);

const OrderedMenuSpicyLevel: Model<IOrderedMenuSpicyLevel> =
  models.OrderedMenuSpicyLevel ||
  model('OrderedMenuSpicyLevel', orderedMenuSpicyLevelSchema);

export default OrderedMenuSpicyLevel;

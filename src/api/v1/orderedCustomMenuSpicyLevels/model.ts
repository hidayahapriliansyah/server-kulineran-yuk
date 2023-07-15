import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { IOrderedCustomMenu } from '../orderedCustomMenus/model';

interface IOrdereCustomMenuSpicyLevel extends TimestampsDocument {
  orderedCustomMenuId: IOrderedCustomMenu['_id'];
  level: number;
}

const orderedCustomMenuSpicyLevelSchema = new Schema<IOrdereCustomMenuSpicyLevel>(
  {
    orderedCustomMenuId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'OrderedCustomMenu',
    },
    level: {
      type: Number,
      required: [true, 'Level maksimal harus diisi'],
    },
  },
  { timestamps: true }
);

const OrderedCustomMenuSpicyLevel: Model<IOrdereCustomMenuSpicyLevel> =
  models.OrderedCustomMenuSpicyLevel ||
  model('OrderedCustomMenuSpicyLevel', orderedCustomMenuSpicyLevelSchema);

export default OrderedCustomMenuSpicyLevel;
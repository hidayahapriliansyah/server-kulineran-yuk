import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { IMenuCart } from './MenuCart';
import { IGroupBotramMenuCart } from './GroupBotramMenuCart';

interface IGroupBotramMenuCartSpicyLevel extends TimestampsDocument {
  groupBotramMenuCartId: IGroupBotramMenuCart['_id'];
  level: number;
}

const groupBotramMenuCartSpicyLevelSchema = new Schema<IGroupBotramMenuCartSpicyLevel>(
  {
    groupBotramMenuCartId: {
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

const GroupBotramMenuCartSpicyLevel: Model<IGroupBotramMenuCartSpicyLevel> =
  models.GroupBotramMenuCartSpicyLevel || model('GroupBotramMenuCartSpicyLevel', groupBotramMenuCartSpicyLevelSchema);

export default GroupBotramMenuCartSpicyLevel;

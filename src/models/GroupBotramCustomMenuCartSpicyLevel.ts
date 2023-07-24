import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { IGroupBotramCustomMenuCart } from './GroupBotramCustomMenuCart';

interface IGroupBotramCustomMenuCartSpicyLevel extends TimestampsDocument {
  groupBotramCustomMenuCartId: IGroupBotramCustomMenuCart['_id'];
  level: number;
}

const groupBotramCustomMenuCartSpicyLevelSchema =
  new Schema<IGroupBotramCustomMenuCartSpicyLevel>(
    {
      groupBotramCustomMenuCartId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'GroupBotramCustomMenuCart',
      },
      level: {
        type: Number,
        default: 0,
      },
    },
    { timestamps: true }
  );

const GroupBotramCustomMenuCartSpicyLevel: Model<IGroupBotramCustomMenuCartSpicyLevel> =
  models.CustomMenuCartSpicyLevel ||
  model(
    'GroupBotramCustomMenuCartSpicyLevel',
    groupBotramCustomMenuCartSpicyLevelSchema
  );

export default GroupBotramCustomMenuCartSpicyLevel;

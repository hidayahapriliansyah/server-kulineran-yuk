import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { IGroupBotram } from '../groupBotrams/model';
import { IRestaurant } from '../restaurants/model';

enum GroupBotramOrderStatus {
  ORDERING = 'ordering',
  READYTOORDER = 'readytoorder',
  ACCEPTED = 'accepted',
  PROCESSED = 'processed',
  DONE = 'done',
  CANCEL = 'cancel',
}

interface IGroupBotramOrder extends TimestampsDocument {
  groupBotramId: IGroupBotram['_id'];
  restaurantId: IRestaurant['_id'];
  totalAmount: number;
  status: GroupBotramOrderStatus;
  isPaid: boolean;
}

const groupBotramOrderSchema = new Schema<IGroupBotramOrder>(
  {
    groupBotramId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'GroupBotram',
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(GroupBotramOrderStatus),
      default: GroupBotramOrderStatus.ORDERING,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const GroupBotramOrder: Model<IGroupBotramOrder> =
  models.GroupBotramOrder || model('GroupBotramOrder', groupBotramOrderSchema);

export default GroupBotramOrder;


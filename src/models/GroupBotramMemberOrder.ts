import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { IGroupBotramMember } from './GroupBotramMember';
import { IOrder } from './Order';

interface IGroupBotramMemberOrder extends TimestampsDocument {
  groupBotramMemberId: IGroupBotramMember['_id'];
  orderId: IOrder['_id'];
}

const groupBotramMemberOrderSchema = new Schema<IGroupBotramMemberOrder>(
  {
    groupBotramMemberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'GroupBotramMember',
    },
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
  },
  { timestamps: true }
);

const GroupBotramMemberOrder: Model<IGroupBotramMemberOrder> =
  models.GroupBotramMemberOrder || model('GroupBotramMemberOrder', groupBotramMemberOrderSchema);

export default GroupBotramMemberOrder;

import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { IGroupBotram } from './GroupBotram';
import { ICustomer } from './Customer';

export enum GroupBotramMemberStatus {
  NOTJOINYET = 'notjoinyet',
  ORDERING = 'ordering',
  ORDERREADY = 'orderready',
  EXIT = 'exit',
  EXPELLED = 'expelled',
}

export interface IGroupBotramMember extends TimestampsDocument {
  groupBotramId: IGroupBotram['_id'] | IGroupBotram;
  customerId: ICustomer['_id'] | ICustomer;
  status: GroupBotramMemberStatus;
}

const groupBotramMemberSchema = new Schema<IGroupBotramMember>(
  {
    groupBotramId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'GroupBotram',
    },
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    status: {
      type: String,
      enum: Object.values(GroupBotramMemberStatus),
    },
  },
  { timestamps: true }
);

const GroupBotramMember: Model<IGroupBotramMember> =
  models.GroupBotramMember ||
  model('GroupBotramMember', groupBotramMemberSchema);

export default GroupBotramMember;

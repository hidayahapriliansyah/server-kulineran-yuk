import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { IGroupBotram } from './GroupBotram';
import { ICustomer } from './Customer';

enum GroupBotramInvitationStatus {
  NORESPONSE = 'noresponse',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

interface IGroupBotramInvitation extends TimestampsDocument {
  groupBotramId: IGroupBotram['_id'];
  customerId: ICustomer['_id'];
  status: GroupBotramInvitationStatus;
  isActive: boolean;
}

const groupBotramInvitationSchema = new Schema<IGroupBotramInvitation>(
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
      enum: Object.values(GroupBotramInvitationStatus),
      default: GroupBotramInvitationStatus.NORESPONSE,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const GroupBotramInvitation: Model<IGroupBotramInvitation> =
  models.GroupBotramInvitation ||
  model('GroupBotramInvitation', groupBotramInvitationSchema);

export default GroupBotramInvitation;

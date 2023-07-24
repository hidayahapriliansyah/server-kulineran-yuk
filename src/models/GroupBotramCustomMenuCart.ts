import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { IGroupBotramMember } from './GroupBotramMember';
import { IGroupBotram } from './GroupBotram';
import { ICustomMenu } from './CustomMenu';

export interface IGroupBotramCustomMenuCart extends TimestampsDocument {
  groupBotramMemberId: IGroupBotramMember['_id'];
  customMenuId: ICustomMenu['_id'];
  groupBotramId: IGroupBotram['_id'];
  quantity: number;
  isDibungkus: boolean;
}

const groupBotramCustomMenuCartSchema = new Schema<IGroupBotramCustomMenuCart>(
  {
    groupBotramMemberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'GroupBotramMember',
    },
    customMenuId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'CustomMenu',
    },
    groupBotramId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'GroupBotram',
    },
    quantity: {
      type: Number,
      required: [true, 'Jumlah item harus diisi'],
      min: [1, 'Item dalam keranjang minimal 1 item'],
    },
    isDibungkus: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const GroupBotamCustomMenuCart: Model<IGroupBotramCustomMenuCart> =
  models.GroupBotamCustomMenuCart || model('GroupBotramCart', groupBotramCustomMenuCartSchema);

export default GroupBotamCustomMenuCart;

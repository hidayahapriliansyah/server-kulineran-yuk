import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { IGroupBotramMember } from './GroupBotramMember';
import { IMenu } from './Menu';
import { IGroupBotram } from './GroupBotram';

export interface IGroupBotramMenuCart extends TimestampsDocument {
  groupBotramMemberId: IGroupBotramMember['_id'];
  menuId: IMenu['_id'];
  groupBotramId: IGroupBotram['_id'];
  quantity: number;
  isDibungkus: boolean;
}

const groupBotramMenuCartSchema = new Schema<IGroupBotramMenuCart>(
  {
    groupBotramMemberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'GroupBotramMember',
    },
    menuId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Menu',
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

const GroupBotamMenuCart: Model<IGroupBotramMenuCart> =
  models.GroupBotamMenuCart || model('GroupBotramCart', groupBotramMenuCartSchema);

export default GroupBotamMenuCart;

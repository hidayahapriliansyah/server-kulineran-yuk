import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../../../global/types';
import { ICustomer } from '../customers/model';
import { IRestaurant } from '../restaurants/model';

enum GroupBotramStatus {
  ORDERING = 'ordering',
  ALLORDERREADY = 'allorderready',
  DONE = 'done',
}

export interface IGroupBotram extends TimestampsDocument {
  creatorCustomerId: ICustomer['_id'];
  restaurantId: IRestaurant['_id'];
  name: string;
  openMembership: boolean;
  status: GroupBotramStatus;
}

const groupBotramSchema = new Schema<IGroupBotram>(
  {
    creatorCustomerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    name: {
      type: String,
      required: [true, 'Nama group botram harus diiisi'],
      minlength: [3, 'Nama group botram minimal memiliki 3 karakter'],
      maxlength: [30, 'Nama group botram maximal memiliki 30 karakter'],
    },
    openMembership: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: Object.values(GroupBotramStatus),
      default: GroupBotramStatus.ORDERING,
    },
  },
  { timestamps: true }
);

const GroupBotram =
  models.GroupBotram || model('GroupBotram', groupBotramSchema);

export default GroupBotram;

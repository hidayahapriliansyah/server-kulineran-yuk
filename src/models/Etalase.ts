import { Schema, Model, model, models } from 'mongoose';
import { IRestaurant } from './Restaurant';
import { TimestampsDocument } from '../global/types';

export interface IEtalase extends TimestampsDocument {
  restaurantId: IRestaurant['_id'];
  name: String;
}

const etalaseSchema = new Schema<IEtalase>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Etalase: Model<IEtalase> =
  models.Etalase || model('Etalase', etalaseSchema);

export default Etalase;

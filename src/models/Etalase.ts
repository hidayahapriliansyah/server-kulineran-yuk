import { Schema, Model, model, models } from 'mongoose';
import { IRestaurant } from './Restaurant';
import { TimestampsDocument } from '../global/types';

export interface IEtalase extends TimestampsDocument {
  restaurantId: IRestaurant['_id'];
  name: string;
  totalItem: number;
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
      minlength: [1, 'Nama minimal memiliki 1 karakter'],
      maxlength: [20, 'Nama etalase maksimal memiliki 20 karakater'],
    }
  },
  { timestamps: true }
);

const Etalase: Model<IEtalase> =
  models.Etalase || model('Etalase', etalaseSchema);

export default Etalase;

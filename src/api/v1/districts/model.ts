import { Schema, Model, model, models } from 'mongoose';
import { IRegency } from '../regencies/model';
import { DocumentWithIdObjectId } from '../../../global/types';

export interface IDistrict extends DocumentWithIdObjectId {
  regencieId: IRegency['id'];
  district: string;
}

const districtSchmea = new Schema<IDistrict>({
  id: {
    type: String,
    required: true,
  },
  regencieId: {
    type: String,
    required: true,
    ref: 'Regency',
  },
  district: {
    type: String,
    required: true,
  },
});

const District: Model<IDistrict> =
  models.District || model('District', districtSchmea);

export default District;

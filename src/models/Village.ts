import { Schema, Model, model, models } from 'mongoose';
import { IDistrict } from './District';
import { DocumentWithIdObjectId } from '../global/types';

export interface IVillage extends DocumentWithIdObjectId {
  id: string;
  districtId: IDistrict['id'];
  village: string;
}

const villageSchmea = new Schema<IVillage>({
  id: {
    type: String,
    required: true,
  },
  districtId: {
    type: String,
    required: true,
    ref: 'District',
  },
  village: {
    type: String,
    required: true,
  },
});

const Village: Model<IVillage> =
  models.Village || model('Village', villageSchmea);

export default Village;

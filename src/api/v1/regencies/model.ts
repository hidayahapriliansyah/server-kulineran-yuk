import { Schema, Model, model, models } from 'mongoose';
import { IProvince } from '../provinces/model';
import { DocumentWithIdObjectId } from '../../../global/types';

export interface IRegency extends DocumentWithIdObjectId {
  id: string;
  provinceId: IProvince['id'];
  regency: string;
}

const regencySchema = new Schema<IRegency>({
  id: {
    type: String,
    required: true,
  },
  provinceId: {
    type: String,
    required: true,
    ref: 'Province',
  },
  regency: {
    type: String,
    required: true,
  },
});

const Regency: Model<IRegency> =
  models.Regency || model('Regencie', regencySchema);

export default Regency;

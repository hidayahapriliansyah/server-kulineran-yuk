import { Schema, Model, model, models } from 'mongoose';
import { DocumentWithIdObjectId } from '../../../global/types';

export interface IProvince extends DocumentWithIdObjectId {
  id: string;
  province: string;
}

const provinceSchema = new Schema<IProvince>({
  id: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
});

const Province: Model<IProvince> = models.Province || model<IProvince>('Province', provinceSchema);

export default Province;

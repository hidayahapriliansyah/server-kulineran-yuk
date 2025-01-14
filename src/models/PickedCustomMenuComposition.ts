import { Schema, Model, model, models } from 'mongoose';
import { TimestampsDocument } from '../global/types';
import { ICustomMenu } from './CustomMenu';
import { ICustomMenuComposition } from './CustomMenuComposition';

export interface IPickedCustomMenuCompositions extends TimestampsDocument {
  customMenuId: ICustomMenu['_id'];
  customMenuCompositionId: ICustomMenuComposition['_id'] | ICustomMenuComposition;
  qty: number;
}

const pickedCustomMenuCompositionSchema =
  new Schema<IPickedCustomMenuCompositions>(
    {
      customMenuId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'CustomMenu',
      },
      customMenuCompositionId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'CustomMenuComposition',
      },
      qty: {
        type: Number,
        required: [
          true,
          'Banyak komposisi custom menu yang diambil harus diisi',
        ],
        min: [1, 'Banyak komposisi custom menu yang diambil minimal 1'],
      },
    },
    { timestamps: true }
  );

const PickedCustomMenuComposition: Model<IPickedCustomMenuCompositions> =
  models.PickedCustomMenuComposition ||
  model('PickedCustomMenuComposition', pickedCustomMenuCompositionSchema);

export default PickedCustomMenuComposition;

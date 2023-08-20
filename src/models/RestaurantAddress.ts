import { Schema, Model, model, models } from 'mongoose';

// types
import { IRestaurant } from './Restaurant';
import { IVillage } from './Village';
import { IDistrict } from './District';
import { IRegency } from './Regency';
import { IProvince } from './Province';
import { TimestampsDocument } from '../global/types';

export interface IRestaurantAddress extends TimestampsDocument {
  restaurantId: IRestaurant['_id'];
  villageId: IVillage['id'];
  villageName: IVillage['village'];
  districtName: IDistrict['district'];
  regencyName: IRegency['regency'];
  provinceName: IProvince['province'];
  detail: string;
}

const restaurantAddressSchema = new Schema<IRestaurantAddress>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant',
    },
    villageId: {
      type: String,
      required: true,
    },
    villageName: {
      type: String,
      required: true,
    },
    districtName: {
      type: String,
      required: true,
    },
    regencyName: {
      type: String,
      required: true,
    },
    provinceName: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      maxlength: [200, 'Detail maksimal memiliki 200 karakter'],
    },
  },
  { timestamps: true }
);

const RestaurantAddress: Model<IRestaurantAddress> =
  models.RestaurantAddress ||
  model('RestaurantAddress', restaurantAddressSchema);

export default RestaurantAddress;

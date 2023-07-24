import { Schema, Model, model, models } from 'mongoose';

// types
import { IRestaurant } from './Restaurant';
import { IVillage } from './Village';
import { IDistrict } from './District';
import { IRegency } from './Regency';
import { IProvince } from './Province';
import { TimestampsDocument } from '../global/types';

interface IRestaurantAddress extends TimestampsDocument {
  createdAt: Date;
  updatedAt: Date;
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
      ref: 'Village',
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
    detail: {
      type: String,
    },
  },
  { timestamps: true }
);

const RestaurantAddress: Model<IRestaurantAddress> =
  models.RestaurantAddress ||
  model('RestaurantAddress', restaurantAddressSchema);

export default RestaurantAddress;

import { Request } from 'express';
import Restaurant, { IRestaurant } from '../../../models/Restaurant';
import { Unauthenticated } from '../../../errors';
import RestaurantAddress, { IRestaurantAddress } from '../../../models/RestaurantAddress';
import Village, { IVillage } from '../../../models/Village';
import District, { IDistrict } from '../../../models/District';
import Regency, { IRegency } from '../../../models/Regency';
import Province, { IProvince } from '../../../models/Province';

export type getRestaurantProfileDataType = {
  avatar: string;
  username: string;
  name: string;
  address: {
    provinceId: string | null;
    regencyId: string | null;
    districtId: string | null;
    villageId: string | null;
    locationLink: string | null;
    detail: string | null;
  } | null,
  contact: string | null;
  imageGallery: string[] | [];
  bussinessHours: {
    openingHours: string | null;
    closingHours: string | null;
    daysOff: string[] | null;
  };
  fasilities: string[] | [];
}

const getProfile = async (req: Request): Promise<getRestaurantProfileDataType | Error> => {
  const { _id: id } = req.user as { _id: string };

  if (!id) {
    throw new Unauthenticated('Credential Error. User is not exist');
  }
  
  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new Unauthenticated('Credential Error. User is not exist');
    }

    const restaurantAddress = await RestaurantAddress.findOne({ restaurantId: restaurant._id });
    const village = await Village.findOne({ id: restaurantAddress?.villageId });
    const district = await District.findOne({ id: village?.districtId });
    const regency = await Regency.findOne({ id: district?.regencyId });
    const province = await Province.findOne({ id: regency?.provinceId });

    const restAddrSummary: getRestaurantProfileDataType['address'] = {
      provinceId: province?.id ?? null,
      regencyId: regency?.id ?? null,
      districtId: district?.id ?? null,
      villageId: village?.id ?? null,
      detail: restaurantAddress?.detail ?? null,
      locationLink: restaurant.locationLink ?? null,
    };

    const result: getRestaurantProfileDataType = {
      avatar: restaurant?.avatar,
      username: restaurant?.username,
      name: restaurant?.name,
      address: restAddrSummary,
      contact: restaurant?.contact ?? null,
      imageGallery: [
        restaurant?.image1 ?? null,
        restaurant?.image2 ?? null,
        restaurant?.image3 ?? null,
        restaurant?.image4 ?? null,
        restaurant?.image5 ?? null,
      ],
      bussinessHours: {
        openingHours: restaurant?.openingHour ?? null,
        closingHours: restaurant?.closingHour ?? null,
        daysOff: restaurant?.daysOff ?? [],
      },
      fasilities: restaurant?.fasilities ?? [],
    };

    return result;
  } catch (error: any) {
    throw new Unauthenticated('Credential Error. User is not exist');
  }
};

export {
  getProfile,
};
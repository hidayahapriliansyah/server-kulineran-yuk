import { Request } from 'express';
import Restaurant, { IRestaurant } from '../../../models/Restaurant';
import { Unauthenticated } from '../../../errors';
import RestaurantAddress, { IRestaurantAddress } from '../../../models/RestaurantAddress';
import Village, { IVillage } from '../../../models/Village';
import District, { IDistrict } from '../../../models/District';
import Regency, { IRegency } from '../../../models/Regency';
import Province, { IProvince } from '../../../models/Province';
import { z } from 'zod';
import db from '../../../db';
import { ObjectId, Schema } from 'mongoose';

export type RestaurantProfileDTO = {
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

const getProfile = async (req: Request): Promise<RestaurantProfileDTO | Error> => {
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

    const restAddrSummary: RestaurantProfileDTO['address'] = {
      provinceId: province?.id ?? null,
      regencyId: regency?.id ?? null,
      districtId: district?.id ?? null,
      villageId: village?.id ?? null,
      detail: restaurantAddress?.detail ?? null,
      locationLink: restaurant.locationLink ?? null,
    };

    const result: RestaurantProfileDTO = {
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

const updateProfileBody = z.object({
  avatar: z.string(),
  username: z.string().regex(/^[a-z0-9._']+$/).min(3).max(30),
	name: z.string().regex(/^[a-zA-Z0-9.,_\s-]+$/).min(3).max(50),
  villageId: z.string(),
  locationLink: z.string(),
  detail: z.string().max(200),
  contact: z.string().max(14),
  imageGallery: z.array(z.string()),
  openingHour: z.string().length(5),
  closingHour: z.string().length(5),
  daysOff: z.array(z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])),
  fasilities: z.array(z.string().max(100)),
});

const updateProfile = async (req: Request): Promise<IRestaurant['_id'] | Error> => {
  type UpdateProfileBody = z.infer<typeof updateProfileBody>;
  type UpdateRestaurantPayload = Omit<UpdateProfileBody, 'villageId' | 'detail'>;
  type UpdateRestaurantAddressPayload = Pick<UpdateProfileBody, 'villageId' | 'detail'>;

  const { _id: restaurantId } = req.user as { _id: ObjectId };
  const body: UpdateProfileBody = updateProfileBody.parse(req.body);
  const session = await db.startSession();
  try {
    session.startTransaction();

    const {
      avatar,
      name,
      username,
      closingHour,
      openingHour,
      daysOff,
      imageGallery,
      fasilities,
      contact,
      locationLink,
      detail,
      villageId
    } = body;
    await Restaurant.findOneAndUpdate({ _id: restaurantId }, {
      avatar,
      name,
      username,
      closingHour,
      openingHour,
      daysOff,
      imageGallery,
      fasilities,
      contact,
      locationLink,
    } as UpdateRestaurantPayload);
    await RestaurantAddress.findOneAndUpdate(
      { restaurantId },
      { detail, villageId } as UpdateRestaurantAddressPayload
    );
    await session.commitTransaction();
    await session.endSession();

    return restaurantId;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
}

export {
  getProfile,
  updateProfile,
};
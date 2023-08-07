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
import convertImageGallery from '../../../utils/convertImageGallery';

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
  avatar: z.string().optional(),
  username: z.string().regex(/^[a-z0-9._']+$/).min(3).max(30).optional(),
	name: z.string().regex(/^[a-zA-Z0-9.,_\s-]+$/).min(3).max(50).optional(),
  villageId: z.string().optional(),
  locationLink: z.string().optional(),
  detail: z.string().max(200).optional(),
  contact: z.string().max(14).optional(),
  imageGallery: z.array(z.string()).optional(),
  openingHour: z.string().length(5).optional(),
  closingHour: z.string().length(5).optional(),
  daysOff: z.array(z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])).optional(),
  fasilities: z.array(z.string().max(100)).optional(),
});

const updateProfile = async (req: Request): Promise<IRestaurant['_id'] | Error> => {
  type UpdateProfileBody = z.infer<typeof updateProfileBody>;
  type UpdateRestaurantPayload = Omit<UpdateProfileBody, 'villageId' | 'detail' | 'imageGallery'> & {
    image1: string;
    image2: string;
    image3: string;
    image4: string;
    image5: string;
  };
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
      fasilities,
      imageGallery,
      contact,
      locationLink,
      detail,
      villageId,
    } = body;

    const imageGalleryObject = convertImageGallery(imageGallery!);

    await Restaurant.findOneAndUpdate({ _id: restaurantId }, {
      avatar,
      name,
      username,
      closingHour,
      openingHour,
      daysOff,
      fasilities,
      contact,
      locationLink,
      ...imageGalleryObject,
    } as UpdateRestaurantPayload);

    const restaurantAddressExist = await RestaurantAddress.findOne({ restaurantId });
    const village = await Village.findOne({ id: villageId });
    const district = await District.findOne({ id: village?.districtId });
    const regency = await Regency.findOne({ id: district?.regencyId });
    const province = await Province.findOne({ id: regency?.provinceId });

    if (restaurantAddressExist) {
      await RestaurantAddress.findOneAndUpdate(
        { restaurantId },
        { detail, villageId } as UpdateRestaurantAddressPayload
      );
    } else {
      await RestaurantAddress.create({
        restaurantId,
        villageId,
        detail,
        villageName: village?.village,
        districtName: district?.district,
        regencyName: regency?.regency,
        provinceName: province?.province,
      });
    }
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
import { Request } from 'express';
import Restaurant, { IRestaurant } from '../../../../models/Restaurant';
import { Unauthenticated } from '../../../../errors';
import RestaurantAddress, { IRestaurantAddress } from '../../../../models/RestaurantAddress';
import Village, { IVillage } from '../../../../models/Village';
import District, { IDistrict } from '../../../../models/District';
import Regency, { IRegency } from '../../../../models/Regency';
import Province, { IProvince } from '../../../../models/Province';
import { z } from 'zod';
import db from '../../../../db';
import { ObjectId, Schema } from 'mongoose';
import convertImageGallery from '../../../../utils/convertImageGallery';

import * as DTO from './types';

const getProfile = async (req: Request): Promise<DTO.ProfileResponse | Error> => {
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

    const restAddrSummary: DTO.ProfileResponse['address'] = {
      provinceId: province?.id ?? null,
      regencyId: regency?.id ?? null,
      districtId: district?.id ?? null,
      villageId: village?.id ?? null,
      detail: restaurantAddress?.detail ?? null,
      locationLink: restaurant.locationLink ?? null,
    };

    const result: DTO.ProfileResponse = {
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

const updateProfile = async (req: Request): Promise<IRestaurant['_id'] | Error> => {
  const { _id: restaurantId } = req.user as { _id: ObjectId };
  const session = await db.startSession();
  try {
    session.startTransaction();
    const body: DTO.ProfileBody = DTO.profileBodySchema.parse(req.body);
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

    const imageGalleryObject = convertImageGallery({
      arrayOfImageUrl: imageGallery!,
      maxImage: 5,
    });

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
    } as DTO.UpdateRestaurantPayload);

    const restaurantAddressExist = await RestaurantAddress.findOne({ restaurantId });
    const village = await Village.findOne({ id: villageId });
    const district = await District.findOne({ id: village?.districtId });
    const regency = await Regency.findOne({ id: district?.regencyId });
    const province = await Province.findOne({ id: regency?.provinceId });

    if (restaurantAddressExist) {
      await RestaurantAddress.findOneAndUpdate(
        { restaurantId },
        { detail, villageId } as DTO.UpdateRestaurantAddressPayload
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
};

const setupProfile = async (req: Request): Promise<IRestaurant['_id'] | Error> => {
  const setupProfileBody = z.object({
    username: z.string().regex(/^[a-z0-9._']+$/).min(3).max(30).nonempty(),
    name: z.string().regex(/^[a-zA-Z0-9.,_\s-]+$/).min(3).max(50).nonempty(),
    password: z.string().min(6).nonempty(),
  });

  type SetupProfileBody = z.infer<typeof setupProfileBody>;

  const { _id: restaurantId } = req.user as { _id: ObjectId };
  
  try {
    const body: SetupProfileBody = setupProfileBody.parse(req.body);
    const { username, name, password } = body;

    const result = await Restaurant.findOneAndUpdate({ _id: restaurantId }, {
      username,
      name,
      password,
    });

    return result!._id;
  } catch (error: any) {
    throw(error);
  }
};

const updateCustomerPaymentType = async (req: Request): Promise<IRestaurant['_id'] | Error> => {
  const updateCustomerPaymentTypeBody = z.object({
    customerPayment: z.enum(['afterorder', 'beforeorder']),
  });
  type UpdateCustomerPaymentTypeBody = z.infer<typeof updateCustomerPaymentTypeBody>;

  const { _id: restaurantId } = req.user as { _id: ObjectId };
  try {
    const body: UpdateCustomerPaymentTypeBody = updateCustomerPaymentTypeBody.parse(req.body);
    const { customerPayment } = body;
    const result = await Restaurant.findOneAndUpdate({ _id: restaurantId }, {
      customerPayment,
    });
    return result!._id;
  } catch (error: any) {
    throw error;
  }
};

export {
  getProfile,
  updateProfile,
  setupProfile,
  updateCustomerPaymentType,
};

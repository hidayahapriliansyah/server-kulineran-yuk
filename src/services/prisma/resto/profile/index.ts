import { Request } from 'express';

import * as DTO from './types';
import { Unauthenticated } from '../../../../errors';
import { Restaurant } from '@prisma/client';
import convertImageGallery from '../../../../utils/convertImageGallery';
import prisma from '../../../../db';
import hashPassword from '../../../../utils/hashPassword';

const getProfile = async (req: Request): Promise<DTO.ProfileResponse | Error> => {
  const { _id: restaurantId } = req.user as { _id: string };

  if (!restaurantId) {
    throw new Unauthenticated('Credential Error. User is not exist');
  }

  try {
    const foundRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        address: {
          include: {
            village: {
              include: {
                district: {
                  include: {
                    regency: {
                      include: {
                        province: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!foundRestaurant) {
      throw new Unauthenticated('Credential Error. User is not exist');
    }

    const result: DTO.ProfileResponse = {
      avatar: foundRestaurant.avatar,
      username: foundRestaurant.username,
      name: foundRestaurant.name,
      address: {
        provinceId: foundRestaurant.address?.village?.district.regency.provinceId ?? null,
        detail: foundRestaurant.address?.detail ?? null,
        locationLink: foundRestaurant.locationLink ?? null,
        regencyId: foundRestaurant.address?.village?.district.regencyId ?? null,
        districtId: foundRestaurant.address?.village?.districtId ?? null,
        villageId: foundRestaurant.address?.villageId ?? null,
      },
      bussinessHours: {
        closingHours: foundRestaurant.closingHour,
        openingHours: foundRestaurant.openingHour,
        daysOff: foundRestaurant.dayOff,
      },
      contact: foundRestaurant.contact,
      fasilities: foundRestaurant.fasilities,
      imageGallery: [
        foundRestaurant.image1 ?? '',
        foundRestaurant.image2 ?? '',
        foundRestaurant.image3 ?? '',
        foundRestaurant.image4 ?? '',
        foundRestaurant.image5 ?? '',
      ],
    };

    return result;
  } catch (error: any) {
    throw new Unauthenticated('Credential Error. User is not exist');
  }
};

const updateProfile = async (req: Request): Promise<Restaurant['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;

  try {
    const body: DTO.ProfileBody = DTO.profileBodySchema.parse(req.body);

    const imageGalleryObject = convertImageGallery({
      arrayOfImageUrl: body.imageGallery!,
      maxImage: 5,
    });

    const updatedRestaurant = await prisma.restaurant.update({
      where: {
        id: restaurantId,
      },
      data: {
        avatar: body.avatar,
        name: body.name,
        username: body.username,
        closingHour: body.closingHour,
        openingHour: body.openingHour,
        dayOff: body.daysOff,
        contact: body.contact,
        locationLink: body.locationLink,
        fasilities: body.fasilities,
        ...imageGalleryObject,
      },
    });

    const restaurantAddressExist =
      await prisma.restaurantAddress.findUnique({ where: { restaurantId }});

    if (body.villageId) {
      const villageDetail = await prisma.village.findUnique({
        where: {
          codeId: body.villageId,
        },
        include: {
          district: {
            include: {
              regency: {
                include: {
                  province: true,
                },
              },
            },
          },
        },
      });
      if (restaurantAddressExist) {
        await prisma.restaurantAddress.update({
          where: { restaurantId },
          data: {
            detail: body.detail,
            villageId: body.villageId,
            villageName: villageDetail?.village,
            districtName: villageDetail?.district.district,
            regencyName: villageDetail?.district.regency.regency,
            provinceName: villageDetail?.district.regency.province.province,
          },
        });
      } else {
        await prisma.restaurantAddress.create({
          data: {
            restaurantId,
            detail: body.detail,
            villageId: body.villageId,
            villageName: villageDetail!.village,
            districtName: villageDetail!.district.district,
            regencyName: villageDetail!.district.regency.regency,
            provinceName: villageDetail!.district.regency.province.province,
          },
        });
      }
    } else {
      if (restaurantAddressExist) {
        await prisma.restaurantAddress.update({
          where: { restaurantId },
          data: {
            detail: body.detail,
          },
        });
      } else {
        await prisma.restaurantAddress.create({
          data: {
            restaurantId,
            detail: body.detail,
          },
        });
      }
    }

    return updatedRestaurant.id;
  } catch (error: any) {
    throw error;
  }
};

const setupProfile = async (req: Request): Promise<Restaurant['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  
  try {
    const body: DTO.SetupProfileBody = DTO.setupProfileBody.parse(req.body);

    const setUpRestaurant = await prisma.restaurant.update({
      where: {
        id: restaurantId,
      },
      data: {
        username: body.username,
        name: body.name,
        password: await hashPassword(body.password),
      }
    })

    return setUpRestaurant.id;
  } catch (error: any) {
    throw(error);
  }
};

const updateCustomerPaymentType = async (req: Request): Promise<Restaurant['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  try {
    const body: DTO.UpdateCustomerPaymentTypeBody =
      DTO.updateCustomerPaymentTypeBody.parse(req.body);
    const updatedRestaurantPayment = await prisma.restaurant.update({
      where: {
        id: restaurantId,
      },
      data: {
        customerPayment: body.customerPayment,
      },
    });
    return updatedRestaurantPayment.id;
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

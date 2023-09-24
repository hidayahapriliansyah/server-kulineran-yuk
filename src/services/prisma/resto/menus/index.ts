import { Request } from 'express';
import { Etalase, Menu, Restaurant } from '@prisma/client';

import * as DTO from './types';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import convertImageGallery from '../../../../utils/convertImageGallery';
import prisma from '../../../../db';
import { BadRequest, NotFound } from '../../../../errors';

const getAllEtalase = async (
  req: Request
): Promise<DTO.EtalaseResponse[] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;

  const etalases = await prisma.etalase.findMany({ where: { restaurantId } });

  const result = etalases.map((item) => ({
    id: item.id,
    name: item.name,
  })) as DTO.EtalaseResponse[];
  return result;
};

const createEtalase = async (
  req: Request
): Promise<Etalase['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  const body: DTO.EtalaseBody =
    DTO.etalaseBodySchema.parse(req.body);

  const createdEtalase = await prisma.etalase.create({
    data: {
      restaurantId,
      name: body.name,
    },
  });

  const result = createdEtalase.id;
  return result;
};

const updateEtalase = async (
  req: Request
): Promise<Etalase['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  const { etalaseId } = req.params;
  if (!etalaseId) {
    throw new BadRequest('etalaseId param is missing.');
  }
  const body: DTO.EtalaseBody = DTO.etalaseBodySchema.parse(req.body);
  const updatedEtalase = await prisma.etalase.update({
    where: { id: etalaseId, restaurantId },
    data: { name: body.name },
  })
  if (!updatedEtalase) {
    throw new NotFound('Etalase is not found.');
  }

  const result = updatedEtalase.id;
  return result;
};

const deleteEtalase = async (
  req: Request
): Promise<Etalase['id'] | Error> => {
  const { id: restaurantId } = req.user as { id: Restaurant['id'] };
  const { etalaseId } = req.params;
  if (!etalaseId) {
    throw new BadRequest('etalasId param is missing.');
  }
  const etalase = await prisma.etalase.findUnique({
    where: { id: etalaseId, restaurantId },
    include: { menus: true },
  });
  if (!etalase) {
    throw new NotFound('Etalase is not found.');
  }
  if (etalase.menus && etalase.menus.length > 0) {
    throw new BadRequest('Etalase with menus can not be deleted. Please ensure the etalase is empty before attempting deletion.');
  }
  const deletedEtalase = await prisma.etalase.delete({
    where: { id: etalaseId, restaurantId },
  });

  const result = deletedEtalase.id;
  return result;
};

const getAllRestaurantMenu = async (
  req: Request
): Promise<DTO.GetMenusWithPaginated | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  let { limit = '10', page = '1', isActive }: {
    limit?: string | number;
    page?: string | number;
    isActive?: string | undefined;
  } = req.query;
  const numberedLimit = Number(limit);
  const numberedPage = Number(page);
  if (isNaN(numberedLimit) || isNaN(numberedPage)) {
    throw new BadRequest('limit or page query is not number.');
  }

  let filter = {};
  if (isActive) {
    if (!['0', '1'].includes(isActive)) {
      throw new BadRequest('isActive is not 0 or 1.');
    }
    filter = {
      ...filter,
      isActive: Boolean(Number(isActive)),
    } as Pick<Menu, 'restaurantId' | 'isActive'>;
  };

  const menus = await prisma.menu.findMany({
    where: {
      restaurantId,
      ...filter,
    },
    take: numberedLimit,
    skip: numberedLimit * (numberedPage - 1),
  });
  const countMenus = await prisma.menu.count({
    where: {
      restaurantId,
      ...filter,
    },
  });

  const result: DTO.GetMenusWithPaginated = {
    menus: menus.map((menu) => ({
      id: menu.id,
      name: menu.name,
      isActive: menu.isActive,
      price: menu.price,
    })),
    pages: Math.ceil(countMenus / numberedLimit),
    total: countMenus,
  };

  return result;
};

const createRestaurantMenu = async (
  req: Request
): Promise<Menu['id'] | Error> => {
  const { id: restaurantId } = req.user as { id: Restaurant['id'] };

  const body: DTO.RestaurantMenuBody =
    DTO.restaurantMenuBodySchema.parse(req.body);

  const slug = slugify(name + `-${nanoid(10)}`);

  const etalaseExist = await prisma.etalase.findUnique({
    where: { id: body.etalaseId },
  });
  if (!etalaseExist) {
    throw new NotFound('Etalase is not found.');
  }

  const cretaedMenu = await prisma.menu.create({
    data: {
      restaurantId,
      etalaseId: body.etalaseId,
      name: body.name,
      slug,
      description: body.description,
      isBungkusAble: body.isBungkusAble,
      price: body.price,
      stock: body.stock,
      image1: body.images[0] as string,
      image2: body.images[1] ?? null,
      image3: body.images[2] ?? null,
      image4: body.images[3] ?? null,
      image5: body.images[4] ?? null,
    },
  });

  if (body.maxSpicy) {
    await prisma.menuSpicyLevel.create({
      data: {
        menuId: cretaedMenu.id,
        maxSpicy: body.maxSpicy,
      },
    });
  }

  const result = cretaedMenu.id;
  return result;
};

const getRestaurantMenuBySlug = async (
  req: Request
): Promise<DTO.RestaurantMenuResponse | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  const { slug } = req.params;
  const menu = await prisma.menu.findUnique({
    where: { restaurantId, slug },
    include: { menuSpicyLevel: true },
  });
  if (!menu) {
    throw new NotFound('Menu is not found.');
  }
  const result: DTO.RestaurantMenuResponse = {
    id: menu.id,
    name: menu.name,
    description: menu.description,
    etalaseId: (menu.etalaseId).toString(),
    images: [
      menu.image1,
      menu.image2,
      menu.image3,
      menu.image4,
      menu.image5,
    ],
    price: menu.price,
    isBungkusAble: menu.isBungkusAble,
    stock: menu.stock,
    maxSpicy: menu.menuSpicyLevel?.maxSpicy,
  };

  return result;

};

const updateRestaurantMenu = async (
  req: Request
): Promise<Menu['id'] | Error> => {
  const { id: restaurantId } = req.user as Pick<Restaurant, 'id' | 'email'>;
  const { menuId } = req.params;
  if (!menuId) {
    throw new BadRequest('menuId param is missing.');
  }

  const body: DTO.RestaurantMenuBody =
    DTO.restaurantMenuBodySchema.parse(req.body);

  const slug = slugify(body.name + `-${nanoid(10)}`);

  const etalaseExist = await prisma.etalase.findUnique({ where: { id: body.etalaseId } });
  if (!etalaseExist) {
    throw new NotFound('Etalase is not found.');
  }

  const updatedMenu = await prisma.menu.update({
    where: { id: menuId, restaurantId },
    data: {
      etalaseId: body.etalaseId,
      name: body.name,
      slug,
      description: body.description,
      isBungkusAble: body.isBungkusAble,
      price: body.price,
      stock: body.stock,
      image1: body.images[0] as string,
      image2: body.images[1] ?? null,
      image3: body.images[2] ?? null,
      image4: body.images[3] ?? null,
      image5: body.images[4] ?? null,
    },
  });

  if (!updatedMenu) {
    throw new NotFound('Menu is not found.');
  }

  const menuSpicyLevelExist = await prisma.menuSpicyLevel.findUnique({
    where: { menuId },
  });
  if (body.maxSpicy) {
    if (menuSpicyLevelExist) {
      await prisma.menuSpicyLevel.update({
        where: { menuId },
        data: { maxSpicy: body.maxSpicy },
      });
    } else {
      await prisma.menuSpicyLevel.create({
        data: {
          menuId: updatedMenu.id,
          maxSpicy: body.maxSpicy,
        }
      });
    }
  } else {
    if (menuSpicyLevelExist) {
      await prisma.menuSpicyLevel.delete({ where: { menuId } });
    }
  }

  const result = updatedMenu.id;
  return result;
};

const deleteRestaurantMenu = async (
  req: Request
): Promise<Menu['id'] | Error> => {
  const { id: restaurantId } = req.user as { id: Restaurant['id'] };
  const { menuId } = req.params;
  if (!menuId) {
    throw new BadRequest('Invalid Request. MenuId is undefined. Please check your input data.');
  }

  const deletedMenu = await prisma.menu.delete({
    where: { id: menuId, restaurantId },
  });
  if (!deletedMenu) {
    throw new NotFound('Menu Id not found. Please input valid id menu.');
  }
  const menuSpicyLevelExist = await prisma.menuSpicyLevel.findUnique({
    where: { menuId: deletedMenu.id },
  });
  if (menuSpicyLevelExist) {
    await prisma.menuSpicyLevel.delete({
      where: { id: menuSpicyLevelExist.id },
    });
  }

  const result = deletedMenu.id;
  return result;
};

export {
  getAllEtalase,
  createEtalase,
  updateEtalase,
  deleteEtalase,
  getAllRestaurantMenu,
  createRestaurantMenu,
  getRestaurantMenuBySlug,
  updateRestaurantMenu,
  deleteRestaurantMenu,
};

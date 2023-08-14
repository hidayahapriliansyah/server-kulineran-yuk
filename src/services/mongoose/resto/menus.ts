import { Request } from 'express';
import mongoose, { ObjectId } from 'mongoose';
import z from 'zod';
import slugify from 'slugify';
import { nanoid } from 'nanoid';

import Menu, { IMenu } from '../../../models/Menu';
import { IRestaurant } from '../../../models/Restaurant';
import Etalase, { IEtalase } from '../../../models/Etalase';
import { BadRequest, NotFound } from '../../../errors';
import MenuSpicyLevel, { IMenuSpicyLevel } from '../../../models/MenuSpicyLevel';
import convertImageGallery from '../../../utils/convertImageGallery';

export type EtalaseResponseDTO = {
  _id: ObjectId;
  name: string;
}

const etalaseBodyDTOSchema = z.object({
  name: z.string().nonempty().max(20),
});

export type EtalaseBodyDTO = z.infer<typeof etalaseBodyDTOSchema>;

const restaurantMenuBodyDTOSchema = z.object({
  name: z.string().nonempty().min(1).max(80).regex(/^[a-zA-Z0-9.'\s-]+$/),
  isBungkusAble: z.boolean().default(false).optional(),
  description: z.string().min(1).max(3000),
  etalaseId: z.string(),
  price: z.number().positive(),
  stock: z.number().optional(),
  images: z.array(z.string()).min(1).max(5),
  maxSpicy: z.number().nullable().default(null).optional(),
});

export type RestaurantMenuBodyDTO = z.infer<typeof restaurantMenuBodyDTOSchema>;
export type RestaurantMenuResponseDTO = RestaurantMenuBodyDTO & { _id: IMenu['_id'] };
export type RestaurantMenuListDTO = {
  _id: IMenu['_id'];
  name: IMenu['name'];
  isActive: IMenu['isActive'];
  price: IMenu['price'];
}[];
export type GetMenusWithPaginated = { menus: RestaurantMenuListDTO, pages: number, total: number };

const getAllRestaurantMenu = async (req: Request): Promise<GetMenusWithPaginated | Error> => {
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id']};
  let { limit = '10', page = '1', isActive }: {
    limit?: string | number;
    page?: string | number;
    isActive?: string | undefined
  } = req.query;
  limit = +limit;
  page = +page;
  if (isNaN(limit) || isNaN(page)) {
    throw new BadRequest('Invalid Request. Please check your input data.');
  }

  let filter = {};
  if (isActive) {
    if (!['0', '1'].includes(isActive)) {
      throw new BadRequest('Invalid Request. Please check your input data.');
    }
    filter = {
      ...filter,
      isActive: Boolean(Number(isActive)),
    } as Pick<IMenu, 'restaurantId' | 'isActive'>;
  };

  try {
    const menus = await Menu.find({ restaurantId, ...filter })
      .limit(limit)
      .skip(limit * (page - 1));
    const count = await Menu.countDocuments({ restaurantId, ...filter });

    const result: GetMenusWithPaginated = {
      menus: menus.map((menu) => ({
        _id: menu._id,
        name: menu.name,
        isActive: menu.isActive,
        price: menu.price,
      })),
      pages: Math.ceil(count / limit),
      total: count,
    };

    return result;
  } catch (error: any) {
    throw error;
  }
};

const createRestaurantMenu = async (req: Request): Promise<IMenu['_id'] | Error> => {
  const { _id: restaurantId } = req.user as { _id: ObjectId };
  try {
    const body: RestaurantMenuBodyDTO =
      restaurantMenuBodyDTOSchema.parse(req.body);

    const {
      name,
      isBungkusAble,
      description,
      etalaseId,
      price,
      stock,
      images,
      maxSpicy,
    } = body;

    const slug = slugify(name + `-${nanoid(10)}`);
    const imageList = convertImageGallery({
      arrayOfImageUrl: images,
      maxImage: 5,
    });

    const etalaseExist = await Etalase.findById(etalaseId);
    if (!etalaseExist) {
      throw new NotFound('Etalase id not found. Please input valid etalase id.');
    }

    const menu = await Menu.create({
      restaurantId,
      etalaseId,
      name,
      slug,
      description,
      isBungkusAble,
      price,
      stock,
      ...imageList,
    });

    if (maxSpicy) {
      await MenuSpicyLevel.create({ menuId: menu._id, maxSpicy });
    }

    const { _id: result } = menu;
    return result;
  } catch (error) {
    throw (error);
  }
};

const getRestaurantMenuBySlug = async (req: Request): Promise<RestaurantMenuResponseDTO | Error> => {
  const { slug } = req.params;
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };

  try {
    const menu = await Menu.findOne({ restaurantId, slug });
    if (!menu) {
      throw new NotFound('Menu slug not found. Please input valid menu slug.');
    }
    const menuSpicyLevel = await MenuSpicyLevel.findOne({ menuId: menu._id });
    const maxSpicy = menuSpicyLevel
      ? menuSpicyLevel.maxSpicy
      : null;
    const result: RestaurantMenuResponseDTO = {
      _id: menu._id,
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
      maxSpicy,
    };

    return result;
  } catch (error: any) {
    throw error;
  }
};

const updateRestaurantMenu = async (req: Request): Promise<IMenu['_id'] | Error> => {
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
  const { menuId } = req.params;
  if (!menuId) {
    throw new BadRequest('Invalid Request. MenuId is undefined. Please check your input data.');
  }

  try {
    // todo do not create menu spicy level if it has one, edit it
    const body: RestaurantMenuBodyDTO =
      restaurantMenuBodyDTOSchema.parse(req.body);

    const {
      name,
      isBungkusAble,
      description,
      etalaseId,
      price,
      stock,
      images,
      maxSpicy,
    } = body;

    const slug = slugify(name + `-${nanoid(10)}`);
    const imageList = convertImageGallery({
      arrayOfImageUrl: images,
      maxImage: 5,
    });

    const etalaseExist = await Etalase.findById(etalaseId);
    if (!etalaseExist) {
      throw new NotFound('Etalase id not found. Please input valid etalase id.');
    }

    const menu = await Menu.findOneAndUpdate({_id: menuId, restaurantId },
      {
        etalaseId,
        name,
        slug,
        description,
        isBungkusAble,
        price,
        stock,
        ...imageList,
      },
    );

    if (!menu) {
      throw new NotFound('Menu Id not found. Please input valid id menu.');
    }
    
    const menuSpicyLevelExist = await MenuSpicyLevel.findOne({ menuId });
    if (maxSpicy) {
      if (menuSpicyLevelExist) {
        await MenuSpicyLevel.findOneAndUpdate({ menuId }, { maxSpicy });
      } else {
        await MenuSpicyLevel.create({ menuId: menu._id, maxSpicy });
      }
    } else {
      if (menuSpicyLevelExist) { 
        await MenuSpicyLevel.findOneAndDelete({ menuId });
      }
    }
    
    const { _id: result } = menu;
    return result;
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw new NotFound('Menu Id not found. Please input valid id menu.');
    }
    throw error;
  }
};

const deleteRestaurantMenu = async (req: Request): Promise<IMenu['_id'] | Error> => {
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
  const { menuId } = req.params;
  if (!menuId) {
    throw new BadRequest('Invalid Request. MenuId is undefined. Please check your input data.');
  }

  try {
    const menu = await Menu.findOneAndDelete({ _id: menuId, restaurantId });
    if (!menu) {
      throw new NotFound('Menu Id not found. Please input valid id menu.');
    }
    const menuSpicyLevelExist = await MenuSpicyLevel.findOne({ menuId: menu._id });
    if (menuSpicyLevelExist) {
      await MenuSpicyLevel.findByIdAndDelete(menuSpicyLevelExist._id);
    }

    const { _id: result } = menu;
    return result;
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw new NotFound('Menu Id not found. Please input valid id menu.');
    }
    throw error;
  }
};

const getAllEtalase = async (req: Request): Promise<EtalaseResponseDTO[] | Error> => {
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
  try {
    const result = await Etalase.find({ restaurantId });
    return result.map((item) => ({
      _id: item._id,
      name: item.name,
    })) as EtalaseResponseDTO[];
  } catch (error: any) {
    throw error;
  }
};

const createEtalase = async (req: Request): Promise<IEtalase['_id'] | Error> => {
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
  try {
    const body: EtalaseBodyDTO =
      etalaseBodyDTOSchema.parse(req.body);
    const { name } = body;
    const result = await Etalase.create({ restaurantId, name });
    return result._id;
  } catch (error: any) {
    throw error;
  }
};

const updateEtalase = async (req: Request): Promise<IEtalase['_id'] | Error> => {
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
  const { etalaseId } = req.params;
  if (!etalaseId) {
    throw new BadRequest('Invalid Request. Please check your input data.');
  }
  try {
    const body: EtalaseBodyDTO =
      etalaseBodyDTOSchema.parse(req.body);
    const { name } = body;
    const result = await Etalase.findOneAndUpdate({ _id: etalaseId, restaurantId }, { name });
    if (!result) {
      throw new NotFound('Etalase Id not found. Please input valid etalase id.');
    }
    return result._id;
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw new NotFound('Menu Id not found. Please input valid id menu.');
    }
    throw error;
  }
};

const deleteEtalase = async (req: Request): Promise<IEtalase['_id'] | Error> => {
  const { _id: restaurantId } = req.user as { _id: IRestaurant['_id'] };
  const { etalaseId } = req.params;
  if (!etalaseId) {
    throw new BadRequest('Invalid Request. Please check your input data.');
  }
  try {
    const etalase = await Etalase.findById(etalaseId);
    if (!etalase) {
      throw new NotFound('Etalase Id not found. Please input valid etalase id.');
    }
    const etalaseHasMenu = await Menu.findOne({ etalaseId, restaurantId });
    if (etalaseHasMenu) {
      throw new BadRequest('Etalase has at least one menu. Etalase can not be deleted. Please make sure etalase is empty to delete it.');
    }
    const result = await Etalase.findOneAndDelete({ _id: etalaseId, restaurantId });
    return result!._id;
  } catch (error: any) {
    throw error;
  }
};

export {
  getAllRestaurantMenu,
  createRestaurantMenu,
  getRestaurantMenuBySlug,
  updateRestaurantMenu,
  deleteRestaurantMenu,
  getAllEtalase,
  createEtalase,
  updateEtalase,
  deleteEtalase,
};
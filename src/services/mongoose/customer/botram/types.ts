import { TypeOf, z } from 'zod';
import { ICustomer } from '../../../../models/Customer';
import { IGroupBotram } from '../../../../models/GroupBotram'
import { IGroupBotramMember } from '../../../../models/GroupBotramMember';
import { IGroupBotramMemberOrder } from '../../../../models/GroupBotramMemberOrder';
import { IGroupBotramOrder } from '../../../../models/GroupBotramOrder';
import { IMenu } from '../../../../models/Menu';
import { IOrder } from '../../../../models/Order';
import { IOrderedCustomMenu } from '../../../../models/OrderedCustomMenu';
import { IOrdereCustomMenuSpicyLevel } from '../../../../models/OrderedCustomMenuSpicyLevel';
import { IOrderedMenu } from '../../../../models/OrderedMenu';
import { IOrderedMenuSpicyLevel } from '../../../../models/OrderedMenuSpicyLevel';
import { IRestaurant } from '../../../../models/Restaurant';

type BotramResponse = {
  _id: IGroupBotram['_id'],
  createdAt: IGroupBotram['createdAt'],
  name: IGroupBotram['name'],
  restaurant: {
    _id: IRestaurant['_id'],
    username: IRestaurant['username'],
    name: IRestaurant['name'],
  },
  admin: {
    username: ICustomer['username'],
    name: ICustomer['name'],
  },
  status: 'ordering' | 'allorderready' | 'done',
  memberCount: number,
}

type FindCustomerResponse = Pick<ICustomer, '_id' | 'username' | 'name' | 'avatar'>;

const createBotramGroupBodySchema = z.object({
  restaurantId: z.string({
      required_error: 'restaurantId harus diisi.',
      invalid_type_error: 'restaurantId harus berupa string.',
    }),
  name: z.string({
      required_error: 'name harus diisi.',
      invalid_type_error: 'name harus berupa string.',
    })
    .nonempty('Nama minimal memiliki 1 karakter.')
    .max(30, 'Nama maksimal memiliki 30 karakter.'),
  members: z.array(z.object({
      _id: z.string({
        required_error: '_id customer harus diisi.',
        invalid_type_error: '_id harus berupa string.',
      }),
    }), {
      required_error: 'members harus diisi.',
      invalid_type_error: 'members harus berupa array.',
    })
    .nonempty('Members minimal memiliki 1 anggota untuk dimasukkan.')
    .max(50, 'Anggota members maksimal 50 orang.'),
});

type CreateBotramGroupBody = z.infer<typeof createBotramGroupBodySchema>;

type GetAllCustomerBotramGroupResponse = {
  _id: BotramResponse['_id'],
  createdAt: BotramResponse['createdAt'],
  name: BotramResponse['name'],
  restaurant: BotramResponse['restaurant'],
  status: BotramResponse['status'],
  memberStatus: 'admin' | 'member',
}[] | [];

type MemberOrder = {
  _id: IGroupBotramMember['_id'],
  username: ICustomer['_id'],
  name: ICustomer['name'],
  status: IGroupBotramMember['status'],
  order: {
    _id: IOrder['_id'],
    total: IOrder['total'],
    isPaid: IOrder['isPaid'],
    orderedMenu: {
      _id: IOrderedMenu['_id'],
      menu: {
        _id: IOrderedMenu['menuId'],
        name: IOrderedMenu['menuName'],
        price: IOrderedMenu['menuPrice'],
      },
      quantity: IOrderedMenu['quantity'],
      totalPrice: number,
      isDibungkus: IOrderedMenu['isDibungkus'],
      spicyLevel?: IOrderedMenuSpicyLevel['level'],
    }[]
    | {
      _id: IOrderedCustomMenu['_id'],
      menu: {
        _id: IOrderedCustomMenu['customMenuId'],
        name: IOrderedCustomMenu['customMenuName'],
        price: IOrderedCustomMenu['customMenuPrice'],
      },
      quantity: IOrderedCustomMenu['quantity'],
      totalPrice: number,
      isDibungkus: IOrderedCustomMenu['isDibungkus'],
      spicyLevel?: IOrdereCustomMenuSpicyLevel['level'],
    }[]
    | [],
  }[],
};

type GetMemberAndMemberOrderBotramGroup = {
  groupBotramId: IGroupBotram['_id'],
  myOrder: MemberOrder | null,
  members: MemberOrder[] | [],
};

export {
  BotramResponse,
  createBotramGroupBodySchema,
  CreateBotramGroupBody,
  FindCustomerResponse,
  GetAllCustomerBotramGroupResponse,
  GetMemberAndMemberOrderBotramGroup,
};

import util from 'util';

import Restaurant from '../../src/models/Restaurant';
import Menu from '../../src/models/Menu';
import MenuSpicyLevel from '../../src/models/MenuSpicyLevel';
import GroupBotram from '../../src/models/GroupBotram';
import GroupBotramMember from '../../src/models/GroupBotramMember';
import GroupBotramMemberOrder from '../../src/models/GroupBotramMemberOrder';
import GroupBotramOrder from '../../src/models/GroupBotramOrder';
import Order from '../../src/models/Order';
import OrderedMenu from '../../src/models/OrderedMenu';
import Etalase from '../../src/models/Etalase';

import config from '../../src/config';
import mockRestaurant from '../mock/adminResto';
import { seblakCeker, esJeruk } from '../mock/menu';
import * as mockEtalase from '../mock/etalase';
import * as mockCustomer from '../mock/customer';
import Customer from '../../src/models/Customer';
import mongoose, { PipelineStage } from 'mongoose';

describe('tryAggregation' , () => {
  beforeAll(async () => {
    await mongoose.connect(config.urlDb);
    // create restaurant
    const restaurant = await Restaurant.create({
      username: mockRestaurant.username,
      email: mockRestaurant.email,
      name: mockRestaurant.name,
      password: mockRestaurant.password,
    });
    // create Etalase
    const etalasePedas = await Etalase.create({
      restaurantId: restaurant._id,
      name: mockEtalase.etalasePedas.name,
    });
    const etalaseMinuman = await Etalase.create({
      restaurantId: restaurant._id,
      name: mockEtalase.etalaseMinuman.name,
    });
    // create menu
    const seblakCekerMenu = await Menu.create({
      restaurantId: restaurant._id,
      name: seblakCeker.name,
      isBungkusAble: true,
      slug: seblakCeker.slug,
      description: seblakCeker.description,
      price: seblakCeker.price,
      stock: seblakCeker.stock,
      isActive: true,
      image1: seblakCeker.image1,
      etalaseId: etalasePedas._id,
    });
    const esJerukMenu = await Menu.create({
      restaurantId: restaurant._id,
      name: esJeruk.name,
      isBungkusAble: true,
      slug: esJeruk.slug,
      description: esJeruk.description,
      price: esJeruk.price,
      stock: esJeruk.stock,
      isActive: true,
      image1: esJeruk.image1,
      etalaseId: etalaseMinuman._id,
    });
    // create spicylevelmenu
    await MenuSpicyLevel.create({
      menuId: seblakCekerMenu._id,
      maxSpicy: 10,
    });
    // create customer x 4
    const customer1 = await Customer.create({
      username: mockCustomer.customerSignup.username,
      name: mockCustomer.customerSignup.name,
      email: mockCustomer.customerSignup.email,
      password: mockCustomer.customerSignup.password,
    });
    const customer2 = await Customer.create({
      username: mockCustomer.customerSignup2.username,
      name: mockCustomer.customerSignup2.name,
      email: mockCustomer.customerSignup2.email,
      password: mockCustomer.customerSignup2.password,
    });
    const customer3 = await Customer.create({
      username: mockCustomer.customerSignup3.username,
      name: mockCustomer.customerSignup3.name,
      email: mockCustomer.customerSignup3.email,
      password: mockCustomer.customerSignup3.password,
    });
    const customer4 = await Customer.create({
      username: mockCustomer.customerSignup4.username,
      name: mockCustomer.customerSignup4.name,
      email: mockCustomer.customerSignup4.email,
      password: mockCustomer.customerSignup4.password,
    });
    // create group botram 
    const botramGroup = await GroupBotram.create({
      creatorCustomerId: customer1._id,
      restaurantId: restaurant._id,
      name: 'Botram Group 1',
    });
    // create group botram member
    const member1 = await GroupBotramMember.create({
      groupBotramId: botramGroup._id,
      customerId: customer1._id,
      status: 'orderready',
    });
    const member2 =  await GroupBotramMember.create({
      groupBotramId: botramGroup._id,
      customerId: customer2._id,
      status: 'orderready',
    });
    const member3 = await GroupBotramMember.create({
      groupBotramId: botramGroup._id,
      customerId: customer3._id,
      status: 'orderready',
    });
    const member4 = await GroupBotramMember.create({
      groupBotramId: botramGroup._id,
      customerId: customer4._id,
      status: 'orderready',
    });
    // create order
    // customer 1 order 1 seblak ceker
    const orderOfCustomer1 = await Order.create({
      customerId: customer1._id,
      restaurantId: restaurant._id,
      isGroup: true,
      total: 8000,
      status: 'readytoorder',
    });
    // customer 2 order 2 seblak ceker
    const orderOfCustomer2 = await Order.create({
      customerId: customer2._id,
      restaurantId: restaurant._id,
      isGroup: true,
      total: 16000,
      status: 'readytoorder',
    });
    // customer 3 order 1 minuman
    const orderOfCustomer3 = await Order.create({
      customerId: customer3._id,
      restaurantId: restaurant._id,
      isGroup: true,
      total: 5000,
      status: 'readytoorder',
    });
    // customer 4 order 2 minuman
    const orderOfCustomer4 = await Order.create({
      customerId: customer4._id,
      restaurantId: restaurant._id,
      isGroup: true,
      total: 10000,
      status: 'readytoorder',
    });
    // create ordered menu
    const orderedMenuofCustomer1 = await OrderedMenu.create({
      orderId: orderOfCustomer1._id,
      menuId: seblakCekerMenu._id,
      menuName: seblakCekerMenu.name,
      menuPrice: seblakCekerMenu.price,
      quantity: 1,
      totalPrice: 8000,
      isDibungkus: false,
    });
    const orderedMenuofCustomer2 = await OrderedMenu.create({
      orderId: orderOfCustomer2._id,
      menuId: seblakCekerMenu._id,
      menuName: seblakCekerMenu.name,
      menuPrice: seblakCekerMenu.price,
      quantity: 2,
      totalPrice: 16000,
      isDibungkus: false,
    });
    const orderedMenuofCustomer3 = await OrderedMenu.create({
      orderId: orderOfCustomer1._id,
      menuId: esJerukMenu._id,
      menuName: esJerukMenu.name,
      menuPrice: esJerukMenu.price,
      quantity: 1,
      totalPrice: 5000,
      isDibungkus: false,
    });
    const orderedMenuofCustomer4 = await OrderedMenu.create({
      orderId: orderOfCustomer1._id,
      menuId: esJerukMenu._id,
      menuName: esJerukMenu.name,
      menuPrice: esJerukMenu.price,
      quantity: 2,
      totalPrice: 10000,
      isDibungkus: false,
    });
    // create group botram order
    await GroupBotramOrder.create({
      groupBotramId: botramGroup._id,
      restaurantId: restaurant._id,
      totalAmount: 39000,
      status: 'readytoorder',
      isPaid: false,
    });
    // create group botram member order
    await GroupBotramMemberOrder.create({
      groupBotramMemberId: member1._id,
      orderId: orderOfCustomer1,
    });
    await GroupBotramMemberOrder.create({
      groupBotramMemberId: member2._id,
      orderId: orderOfCustomer2,
    });
    await GroupBotramMemberOrder.create({
      groupBotramMemberId: member3._id,
      orderId: orderOfCustomer3,
    });
    await GroupBotramMemberOrder.create({
      groupBotramMemberId: member4._id,
      orderId: orderOfCustomer4,
    });
  });
  afterAll(async () => {
    await OrderedMenu.deleteMany({});
    await Order.deleteMany({});
    await GroupBotramOrder.deleteMany({});
    await GroupBotramMemberOrder.deleteMany({});
    await GroupBotramMember.deleteMany({});
    await GroupBotram.deleteMany({});
    await Customer.deleteMany({});
    await MenuSpicyLevel.deleteMany({});
    await Menu.deleteMany({});
    await Etalase.deleteMany({});
    await Restaurant.deleteMany({});

    await mongoose.connection.close();
  });
  it('nyoba hasil aggregation', async () => {
    const pipeline = [
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      {
        $project: {
          _id: 1,
          customer: {
            _id: '$customer._id',
            username: '$customer.username',
            name: '$customer.name',
          }
        },
      },
      {
        $lookup: {
          from: 'groupbotrammemberorders',
          localField: '_id',
          foreignField: 'groupBotramMemberId',
          as: 'memberOrder',
        },
      },
      {
        $unwind: '$memberOrder'
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'memberOrder.orderId',
          foreignField: '_id',
          as: 'memberOrder.order'
        }
      },
      {
        $unwind: '$memberOrder.order'
      },
      {
        $lookup: {
          from: 'orderedmenus',
          localField: 'memberOrder.order._id',
          foreignField: 'orderId',
          as: 'memberOrder.order.orderedMenus',
        }
      },
      {
        $group: {
          _id: '$_id',
          member: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$member', { memberOrder: '$member.memberOrder.order' }]
          }
        }
      }
    ];
    const result = await GroupBotramMember.aggregate(pipeline)
    console.log(util.inspect(result, { showHidden: false, depth: null }));

  });
});
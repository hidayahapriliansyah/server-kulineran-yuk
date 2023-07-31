import mongoose from 'mongoose';
import config from '../../../../../src/config';
import Restaurant, { IRestaurant } from '../../../../../src/models/Restaurant';
import { getProfile, getRestaurantProfileDataType } from '../../../../../src/services/mongoose/resto/profile';
import { Request } from 'express';
import { Unauthorized } from '../../../../../src/errors';
import RestaurantAddress, { IRestaurantAddress } from '../../../../../src/models/RestaurantAddress';

// getProfile
describe('getProfile', () => {
  beforeEach(async () => {
    await mongoose.connect(config.urlDb);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await RestaurantAddress.deleteMany({});
    await mongoose.connection.close();
  });
  // success
  // should result restaurant profile data username and name only
  it('should result restaurant profile data username and name only', async () => {
    const restaurantData = {
      username: 'restousername123',
      name: 'Resto 1234',
      email: 'resto1234@gmail.com',
      password: 'hellopasswrod',
    };

    const restaurant = await Restaurant.create(restaurantData);
    const { _id } = restaurant;

    const req = {
      user: { _id }
    } as unknown as Request;

    const result = await getProfile(req) as getRestaurantProfileDataType;
    expect(result.username).toBe(restaurantData.username);
    expect(result.name).toBe(restaurantData.name);
    expect(result.address).toBeDefined();
    expect(result.address!.detail).toBeNull();
    expect(result.address!.districtId).toBeNull();
    expect(result.address!.locationLink).toBeNull();
    expect(result.address!.provinceId).toBeNull();
    expect(result.address!.regencyId).toBeNull();
    expect(result.address!.villageId).toBeNull();
    expect(result.bussinessHours).toBeDefined();
    expect(result.bussinessHours!.closingHours).toBeNull();
    expect(result.bussinessHours!.openingHours).toBeNull();
    expect(result.bussinessHours!.daysOff).toStrictEqual([]);
    expect(result.contact).toBe(null);
    expect(result.fasilities).toStrictEqual([]);
    expect(result.imageGallery).toStrictEqual([null, null, null, null, null]);
  });
  // should result restaurant profile data including all data with valid address
  it('should result restaurant profile data including all data with valid address', async () => {
    // restaurant data
    const restaurantData = {
      username: 'restousername123',
      name: 'Resto 1234',
      email: 'resto1234@gmail.com',
      password: 'hellopasswrod',
      locationLink: 'https://www.google.com/maps/place/Mekkah+Arab+Saudi/@21.4229429,39.8245511,17.44z/data=!4m6!3m5!1s0x15c21b4ced818775:0x98ab2469cf70c9ce!8m2!3d21.3890824!4d39.8579118!16zL20vMDU4d3A!5m1!1e4?entry=ttu',
      contact: '082315317359',
      image1: 'https://image.contoh.com/1',
      image2: 'https://image.contoh.com/1',
      image3: 'https://image.contoh.com/1',
      image4: 'https://image.contoh.com/1',
      image5: 'https://image.contoh.com/1',
      openingHour: '08:00',
      closingHour: '21:00',
      daysOff: ['sunday'],
      fasilities: ['Free wifi'],
    };
    const restaurant = await Restaurant.create(restaurantData);

    // address data
    const addressData = {
      villageId: '3206161005',
      villageName: 'GUNUNGTANJUNG',
      districtName: 'GUNUNGTANJUNG',
      regencyName: 'KABUPATEN TASIKMALAYA',
      provinceName: 'JAWA BARAT',
      detail: 'Kp. Bantarhuni RT 02 RW 02',
    };
    const { _id } = restaurant;
    await RestaurantAddress.create({ restaurantId: _id, ...addressData });

    const req = {
      user: { _id }
    } as unknown as Request;

    const result = await getProfile(req) as getRestaurantProfileDataType;

    expect(result.username).toBe(restaurantData.username);
    expect(result.name).toBe(restaurantData.name);
    expect(result.address).toBeDefined();
    expect(result.address!.detail).toBe(addressData.detail);
    expect(result.address!.districtId).toBe('3206161');
    expect(result.address!.locationLink).toBe(restaurantData.locationLink);
    expect(result.address!.provinceId).toBe('32');
    expect(result.address!.regencyId).toBe('3206');
    expect(result.address!.villageId).toBe('3206161005');
    expect(result.bussinessHours).toBeDefined();
    expect(result.bussinessHours!.closingHours).toBe(restaurantData.closingHour);
    expect(result.bussinessHours!.openingHours).toBe(restaurantData.openingHour);
    expect(result.bussinessHours!.daysOff).toStrictEqual(restaurantData.daysOff);
    expect(result.contact).toBe(restaurantData.contact);
    expect(result.fasilities).toStrictEqual(restaurantData.fasilities);
    expect(result.imageGallery).toStrictEqual([
      restaurantData.image1,
      restaurantData.image2,
      restaurantData.image3,
      restaurantData.image4,
      restaurantData.image5,
    ]);
  });
  // error
  // shoudl throw Unauthorized error if id ngaco
  it('shoudl throw Unauthorized error if id ngaco', async () => {
    const _id = 'ngacoidna';
    const req = {
      user: { _id }
    } as unknown as Request;

    try {
      await getProfile(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Unauthorized);
    }
  });
  // shoudl throw Unauthorized error if id undefined
  it('shoudl throw Unauthorized error if id undefined', async () => {
    const req = {
      user: {}
    } as unknown as Request;

    try {
      const result = await getProfile(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Unauthorized);
    }
  });
});
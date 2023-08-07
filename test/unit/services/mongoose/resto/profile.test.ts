import mongoose, { ObjectId } from 'mongoose';
import config from '../../../../../src/config';
import Restaurant, { IRestaurant } from '../../../../../src/models/Restaurant';
import { getProfile, RestaurantProfileDTO, updateProfile } from '../../../../../src/services/mongoose/resto/profile';
import { Request } from 'express';
import { Unauthenticated } from '../../../../../src/errors';
import RestaurantAddress, { IRestaurantAddress } from '../../../../../src/models/RestaurantAddress';
import { ZodError } from 'zod';

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

    const result = await getProfile(req) as RestaurantProfileDTO;
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
    expect(result.imageGallery).toStrictEqual(['', '', '', '', '']);
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

    const result = await getProfile(req) as RestaurantProfileDTO;

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
  // shoudl throw Unauthenticated error if id ngaco
  it('shoudl throw Unauthenticated error if id ngaco', async () => {
    const _id = 'ngacoidna';
    const req = {
      user: { _id }
    } as unknown as Request;

    try {
      await getProfile(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Unauthenticated);
    }
  });
  // shoudl throw Unauthenticated error if id undefined
  it('shoudl throw Unauthenticated error if id undefined', async () => {
    const req = {
      user: {}
    } as unknown as Request;

    try {
      const result = await getProfile(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Unauthenticated);
    }
  });
});

describe('testing updateProfile', () => {
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
    daysOff: ['Sunday'],
    fasilities: ['Free wifi'],
  };

  beforeEach(async () => {
    await mongoose.connect(config.urlDb);
    await Restaurant.create(restaurantData);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await RestaurantAddress.deleteMany({});
    await mongoose.connection.close();
  });

  // should give error if detail more than 200 char
  it('should give error if detail more than 200 char', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: {
        _id: restaurantId,
      },
      body: {
        detail: 'sfgsfdhgjksdfhgjkdfnjnsjdfvnkdjfgjsdfhshdfbsbfvweutyw3948578357sdfsdfjsvjsfhjsdfnjsndsvhsbdfhsbdfhsbdfhsbdhfbsdhfbhsdfhsdbfhsbdfsjgshkfhkcklghjkfdjdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfsdffgseyrtrty56yueu6dfgfdgfgsdfgsdfgsfdgsdfgsdfgsfgsdfgsdfgsdfgsdf',
      }
    } as unknown as Request;

    try {
      await updateProfile(req);
    } catch (error: any | ZodError) {
      expect(error).toBeInstanceOf(ZodError);
      const nameValidationError = error.issues.filter(
        (issue: { path: string[] }) => issue.path[0] === 'detail'
      )[0];
      expect(nameValidationError.message).toBe(
        'String must contain at most 200 character(s)'
      );
    }
  });
  // contact
  // should give error if contact more than 14 char
  it('should give error if contact more than 14 char', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: {
        _id: restaurantId,
      },
      body: {
        contact: '0215484845454545454',
      }
    } as unknown as Request;

    try {
      await updateProfile(req);
    } catch (error: any | ZodError) {
      expect(error).toBeInstanceOf(ZodError);
      const nameValidationError = error.issues.filter(
        (issue: { path: string[] }) => issue.path[0] === 'contact'
      )[0];
      expect(nameValidationError.message).toBe(
        'String must contain at most 14 character(s)'
      );
    }
  });
  // imageGallery
  // should give error if imageGallery is not array of string
  it('should give error if imageGallery is not array of string', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: {
        _id: restaurantId,
      },
      body: {
        imageGallery: '0215484845454545454',
      }
    } as unknown as Request;

    try {
      await updateProfile(req);
    } catch (error: any | ZodError) {
      expect(error).toBeInstanceOf(ZodError);
      const nameValidationError = error.issues.filter(
        (issue: { path: string[] }) => issue.path[0] === 'imageGallery'
      )[0];
      expect(nameValidationError.message).toBe(
        'Expected array, received string'
      );
    }
  });
  // opening hour
  // should give error if opening hour length is not 5
  it('should give error if opening hour length is not 5', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: {
        _id: restaurantId,
      },
      body: {
        openingHour: '1',
      }
    } as unknown as Request;

    try {
      await updateProfile(req);
    } catch (error: any | ZodError) {
      expect(error).toBeInstanceOf(ZodError);
      const nameValidationError = error.issues.filter(
        (issue: { path: string[] }) => issue.path[0] === 'openingHour'
      )[0];
      expect(nameValidationError.message).toBe(
        'String must contain exactly 5 character(s)'
      );
    }
  });
  // closing hour
  // should give error if closing hour length is not 5
  it('should give error if closing hour length is not 5', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: {
        _id: restaurantId,
      },
      body: {
        closingHour: '1sdfsdfsdf',
      }
    } as unknown as Request;

    try {
      await updateProfile(req);
    } catch (error: any | ZodError) {
      expect(error).toBeInstanceOf(ZodError);
      const nameValidationError = error.issues.filter(
        (issue: { path: string[] }) => issue.path[0] === 'closingHour'
      )[0];
      expect(nameValidationError.message).toBe(
        'String must contain exactly 5 character(s)'
      );
    }
  });
  // daysoff
  // should give error if daysoff is not array of valid value
  it('should give error if daysoff is not array of valid value', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: {
        _id: restaurantId,
      },
      body: {
        daysOff: ['1sdfsdfsdf'],
      }
    } as unknown as Request;

    try {
      await updateProfile(req);
    } catch (error: any | ZodError) {
      expect(error).toBeInstanceOf(ZodError);
      const nameValidationError = error.issues.filter(
        (issue: { path: string[] }) => issue.path[0] === 'daysOff'
      )[0];
      expect(nameValidationError.message).toContain('Invalid enum value. Expected \'Sunday\' | \'Monday\' | \'Tuesday\' | \'Wednesday\' | \'Thursday\' | \'Friday\' | \'Saturday\', received');
    }
  });
  // fasilities
  // should give error if fasilities is not array of string that max with 100
  it('should give error if fasilities is not array of string that max with 100', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: {
        _id: restaurantId,
      },
      body: {
        fasilities: ['1sdfsdfsdfgdibuhdirthdb fjbdjvdvbjhfvsghcsvbvdvbjhsdfsdghfvsgfsghdvfhsgdvfshdfvhsdgdghfghfghfghfghfghfghdfhdfhbcvbhdfhfghdfhjdrtuyrtdghfghfghfghfdhdfhdfhfghdfhdhhdhdhd'],
      }
    } as unknown as Request;

    try {
      await updateProfile(req);
    } catch (error: any | ZodError) {
      expect(error).toBeInstanceOf(ZodError);
      const nameValidationError = error.issues.filter(
        (issue: { path: string[] }) => issue.path[0] === 'fasilities'
      )[0];
      expect(nameValidationError.message).toBe(
        'String must contain at most 100 character(s)'
      );
    }
  });
  // testing validation
  // should
  // success
  it('should return valid value after updating profile', async () => {
    const restaurant = await Restaurant.findOne();
    const restaurantAddress = await RestaurantAddress.findOne({ restaurantId: restaurant!._id });
    
    const updateBodyData = {
      avatar: restaurant!.avatar,
      username: restaurant!.username,
      name: 'Nama Restaurant Baru',
      villageId: '3206161005',
      locationLink: 'https://locationlink.apagituch',
      detail: 'Kp. Bantarhuni RT 02 RW 02',
      contact: '0823123456789',
      imageGallery: [
        'https://imagegallery.image1',
        'https://imagegallery.image2',
      ],
      openingHour: '08:00',
      closingHour: '21:00',
      daysOff: ['Wednesday'],
      fasilities: ['Free wifi', 'Area bebas rokok'],
    };

    const req = {
      user: {
        _id: restaurant!._id,
      },
      body: {
        ...updateBodyData,
      },
    } as unknown as Request;

  
    const result = await updateProfile(req);
    expect(
      mongoose.Types.ObjectId.isValid(result as unknown as string)
    ).toBe(true);
    const updatedRestaurant = await Restaurant.findById(result);
    const updatedRestaurantAddress = await RestaurantAddress.findOne({ restaurantId: result });

    expect(updatedRestaurant!.avatar).toBe(restaurant!.avatar);
    expect(updatedRestaurant!.username).toBe(restaurant!.username);
    expect(updatedRestaurant!.name).toBe(updatedRestaurant!.name)
    expect(updatedRestaurant!.locationLink).toBe(updatedRestaurant!.locationLink);
    expect(updatedRestaurant!.contact).toBe(updatedRestaurant!.contact);
    expect(updatedRestaurant!.image1).toBe(updateBodyData.imageGallery[0]);
    expect(updatedRestaurant!.image2).toBe(updateBodyData.imageGallery[1]);
    expect(updatedRestaurant!.image3).toBe('');
    expect(updatedRestaurant!.image4).toBe('');
    expect(updatedRestaurant!.image5).toBe('');
    expect(updatedRestaurant!.daysOff).toStrictEqual(updateBodyData.daysOff);
    expect(updatedRestaurant!.closingHour).toBe(updateBodyData.closingHour);
    expect(updatedRestaurant!.openingHour).toBe(updateBodyData.openingHour);
    expect(updatedRestaurant!.fasilities).toStrictEqual(updateBodyData.fasilities);

    expect(restaurantAddress).toBeNull();
    expect(updatedRestaurantAddress!.villageId).toBe(updatedRestaurantAddress!.villageId);
    expect(updatedRestaurantAddress!.villageName).toBe('GUNUNGTANJUNG');
    expect(updatedRestaurantAddress!.districtName).toBe('GUNUNGTANJUNG');
    expect(updatedRestaurantAddress!.regencyName).toBe('KABUPATEN TASIKMALAYA');
    expect(updatedRestaurantAddress!.provinceName).toBe('JAWA BARAT');
    expect(updatedRestaurantAddress!.detail).toBe(updatedRestaurantAddress!.detail);
  });
});
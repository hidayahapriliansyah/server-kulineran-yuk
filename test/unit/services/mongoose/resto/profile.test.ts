import mongoose, { ObjectId, mongo } from 'mongoose';
import config from '../../../../../src/config';
import Restaurant, { IRestaurant } from '../../../../../src/models/Restaurant';
import { getProfile, RestaurantProfileDTO, updateProfile, setupProfile, updateCustomerPaymentType } from '../../../../../src/services/mongoose/resto/profile';
import { Request } from 'express';
import { Unauthenticated } from '../../../../../src/errors';
import RestaurantAddress from '../../../../../src/models/RestaurantAddress';
import { UnknownKeysParam, ZodError } from 'zod';

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

describe('testing setupProfile', () => {
  describe('username field', () => {
    const userProfileSignupViaOauthData = {
      username: 'hidayahapriliansyah',
      name: 'Hidayah Apriliansyah',
      email: 'adihidayahapriliansyah@gmail.com',
    };

    beforeEach(async () => {
      await mongoose.connect(config.urlDb);
      await Restaurant.create({
        username: userProfileSignupViaOauthData.username,
        name: userProfileSignupViaOauthData.name,
        email: userProfileSignupViaOauthData.email,
        isVerified: true,
      });
    });

    afterEach(async () => {
      await Restaurant.deleteMany({});
      await mongoose.connection.close();
    });
    // error
    // should throw error if username is undefined
    it('should throw error if username is undefined', async () => {
      const restaurant = await Restaurant.findOne();
      const req = { 
        user: restaurant!._id,
        body: {}
      } as unknown as Request;
      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('username');
        const usernameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'username'
        )[0];
        expect(usernameValidationError.message).toBe('Required');
      }
    });
    // should return validation error if username field is empty
    it('should return validation error if username field is empty', async () => {
      const restaurant = await Restaurant.findOne();
      const req = { 
        user: restaurant!._id,
        body: { username: '' }
      } as unknown as Request;
      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('username');
        const usernameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'username'
        )[0];
        expect(usernameValidationError.message).toBe('Invalid');
      }
    });
    // should return validation error if username has invalid character
    it('should return validation error if username has invalid character', async () => {
      const restaurant = await Restaurant.findOne();
      const req = {
        user: restaurant!._id,
        body: {
          username: 'werrt--',
        },
      } as unknown as Request;
      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('username');
        const usernameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'username'
        )[0];
        expect(usernameValidationError.message).toBe('Invalid');
      }
    });
    // should return validation error if username has less than 3 character
    it('should return validation error if username has less than 3 character', async () => {
      const restaurant = await Restaurant.findOne();
      const req = {
        user: restaurant!._id,
        body: {
          username: 'us',
        },
      } as unknown as Request;

      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('username');
        const usernameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'username'
        )[0];
        expect(usernameValidationError.message).toBe(
          'String must contain at least 3 character(s)'
        );
      }
    });
    // should return validation error if username has more than 30 character
    it('should return validation error if username has more than 30 character', async () => {
      const restaurant = await Restaurant.findOne();
      const req = {
        user: restaurant!._id,
        body: {
          username:
            'usrererhdjfhdfdfdfdfdf999999999999999999999999999999999ffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        },
      } as unknown as Request;
      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('username');
        const usernameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'username'
        )[0];
        expect(usernameValidationError.message).toBe(
          'String must contain at most 30 character(s)'
        );
      }
    });
  });

  describe('name field', () => {
    const userProfileSignupViaOauthData = {
      username: 'hidayahapriliansyah',
      name: 'Hidayah Apriliansyah',
      email: 'adihidayahapriliansyah@gmail.com',
    };

    beforeEach(async () => {
      await mongoose.connect(config.urlDb);
      await Restaurant.create({
        username: userProfileSignupViaOauthData.username,
        name: userProfileSignupViaOauthData.name,
        email: userProfileSignupViaOauthData.email,
        isVerified: true,
      });
    });

    afterEach(async () => {
      await Restaurant.deleteMany({});
      await mongoose.connection.close();
    });

    // should throw error if name is undefined
    it('should throw error if name is undefined', async () => {
      const restaurant = await Restaurant.findOne();
      const req = { 
        user: restaurant!._id,
        body: {}
      } as unknown as Request;
      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('name');
        const nameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'name'
        )[0];
        expect(nameValidationError.message).toBe('Required');
      }
    });
    // should return validation error if name field is empty
    it('should return validation error if name field is empty', async () => {
      const restaurant = await Restaurant.findOne();
      const req = { 
        user: restaurant!._id,
        body: { name: '' } 
      } as unknown as Request;
      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('name');
        const nameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'name'
        )[0];
        expect(nameValidationError.message).toBe('Invalid');
      }
    });
    // should return validation error if name has invalid character
    it('should return validation error if name has invalid character', async () => {
      const restaurant = await Restaurant.findOne();
      const req = { 
        user: restaurant!._id,
        body: { name: ')(=+}{' } 
      } as unknown as Request;
      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('name');
        const usernameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'name'
        )[0];
        expect(usernameValidationError.message).toBe('Invalid');
      }
    });
    // should return validation error if name has less than 3 character
    it('should return validation error if name has less than 3 character', async () => {
      const restaurant = await Restaurant.findOne();
      const req = {
        user: restaurant!._id,
        body: { name: 's' }
      } as unknown as Request;
      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('name');
        const nameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'name'
        )[0];
        expect(nameValidationError.message).toBe(
          'String must contain at least 3 character(s)'
        );
      }
    });
    // should return validation error if name has more than 50 character
    it('should return validation error if name has more than 50 character', async () => {
      const restaurant = await Restaurant.findOne();
      const req = {
        user: restaurant!._id,
        body: {
          name: 'sdfjgkdfgdfhgkjdfhgkjdfkghdfjkgkdjfhgkjdfhgjkdfguerty968934534593499938475347534587345739457394857394589347593845938475345734957394573498573945734985734573949.-_,',
        },
      } as unknown as Request;
      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('name');
        const nameValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'name'
        )[0];
        expect(nameValidationError.message).toBe(
          'String must contain at most 50 character(s)'
        );
      }
    });
  });

  describe('password field', () => {
    const userProfileSignupViaOauthData = {
      username: 'hidayahapriliansyah',
      name: 'Hidayah Apriliansyah',
      email: 'adihidayahapriliansyah@gmail.com',
    };

    beforeEach(async () => {
      await mongoose.connect(config.urlDb);
      await Restaurant.create({
        username: userProfileSignupViaOauthData.username,
        name: userProfileSignupViaOauthData.name,
        email: userProfileSignupViaOauthData.email,
        isVerified: true,
      });
    });

    afterEach(async () => {
      await Restaurant.deleteMany({});
      await mongoose.connection.close();
    });

    // should throw error if password is undefined
    it('should return validation error if password field is undefined', async () => {
      const restaurant = await Restaurant.findOne();
      const req = {
        user: restaurant!._id,
        body: {}
      } as unknown as Request;
      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('password');
        const passwordValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'password'
        )[0];
        expect(passwordValidationError.message).toBe('Required');
      }
    });
    // should return validation error if password field is empty
    it('should return validation error if password field is empty', async () => {
      const restaurant = await Restaurant.findOne();
      const req = {
        user: restaurant!._id,
        body: { password: '' }
      } as unknown as Request;
      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('password');
        const passwordValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'password'
        )[0];
        expect(passwordValidationError.message).toBe(
          'String must contain at least 6 character(s)'
        );
      }
    });
    // should return validation error if password has less than 6 character
    it('should return validation error if password has less than 6 character', async () => {
      const restaurant = await Restaurant.findOne();
      const req = { 
        user: restaurant!._id,
        body: { password: '7894f' }
      } as unknown as Request;
      try {
        await setupProfile(req);
      } catch (error: any | ZodError) {
        expect(error).toBeInstanceOf(ZodError);
        expect(
          error.issues.map((issue: { path: string[] }) => issue.path[0])
        ).toContain('password');
        const passwordValidationError = error.issues.filter(
          (issue: { path: string[] }) => issue.path[0] === 'password'
        )[0];
        expect(passwordValidationError.message).toBe(
          'String must contain at least 6 character(s)'
        );
      }
    });
  });

  // success
  describe('success setup profile', () => {
    const userProfileSignupViaOauthData = {
      username: 'hidayahapriliansyah',
      name: 'Hidayah Apriliansyah',
      email: 'adihidayahapriliansyah@gmail.com',
    };

    beforeEach(async () => {
      await mongoose.connect(config.urlDb);
      await Restaurant.create({
        username: userProfileSignupViaOauthData.username,
        name: userProfileSignupViaOauthData.name,
        email: userProfileSignupViaOauthData.email,
        isVerified: true,
      });
    });

    afterEach(async () => {
      await Restaurant.deleteMany({});
      await mongoose.connection.close();
    });

    it('should return restaurant id if setup profile is successed', async () => {
      const restaurant = await Restaurant.findOne();
      const setupBodyData = {
        username: 'warungmakansederhana',
        name: 'Warung Makan Sederhana',
        password: '&YDFysdfhg232',
      };
      const req = {
        user: restaurant!._id,
        body: {
          ...setupBodyData,
        }
      } as unknown as Request;

      const result = await setupProfile(req);
      const updatedRestaurant = await Restaurant.findById(result);
      expect(
        mongoose.Types.ObjectId.isValid(result as unknown as string)
      ).toBe(true);
      expect(updatedRestaurant!.username).toBe(setupBodyData.username);
      expect(updatedRestaurant!.name).toBe(setupBodyData.name);
      expect(updatedRestaurant!.password).not.toBe(setupBodyData.password);
    });
  });
});

describe('testing updateCustomerPaymentType', () => {
  const userProfileSignupViaFormData = {
    username: 'hidayahapriliansyah',
    name: 'Hidayah Apriliansyah',
    email: 'adihidayahapriliansyah@gmail.com',
    password: '34y7rheurtheurt',
  };

  beforeEach(async () => {
    await mongoose.connect(config.urlDb);
    await Restaurant.create({
      username: userProfileSignupViaFormData.username,
      name: userProfileSignupViaFormData.name,
      email: userProfileSignupViaFormData.email,
      password: userProfileSignupViaFormData.password,
      isVerified: true,
    });
  });

  afterEach(async () => {
    await Restaurant.deleteMany({});
    await mongoose.connection.close();
  });
  // error
  // should give error if customerPayment property is empty
  
  it('should give error if customerPayment property is empty', async () => {
    const restaurant = await Restaurant.findOne();
    const req = {
      user: {
        _id: restaurant!._id,
      },
      body: {},
    } as unknown as Request;

    try {
      await updateCustomerPaymentType(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('customerPayment');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should give error if customerPayment property is not valid base on enum
  it('should give error if customerPayment property is not valid base on enum', async () => {
    const restaurant = await Restaurant.findOne();
    const req = {
      user: {
        _id: restaurant!._id,
      },
      body: {
        customerPayment: 'afterorde',
      },
    } as unknown as Request;

    try {
      await updateCustomerPaymentType(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('customerPayment');
      expect(error.errors[0].message).toContain('Invalid enum value. Expected \'afterorder\' | \'beforeorder\', received');
    }
  });
  // success
  // should give result id and customerPayment is the same like inputted
  it('should give result id and customerPayment is the same like inputted', async () => {
    const restaurant = await Restaurant.findOne();
    const req = {
      user: {
        _id: restaurant!._id,
      },
      body: {
        customerPayment: 'beforeorder',
      },
    } as unknown as Request;

    const result = await updateCustomerPaymentType(req);
    const updatedCustomerTypeRestaurant = await Restaurant.findById(result); 
    expect(mongoose.Types.ObjectId.isValid(result as unknown as string))
      .toBe(true);
    expect(updatedCustomerTypeRestaurant!.customerPayment).not.toBe(restaurant!.customerPayment);
    expect(updatedCustomerTypeRestaurant!.customerPayment).toBe('beforeorder');
  });
});
import mongoose from 'mongoose';
import createRestaurantNotification from '../../../src/utils/createRestaurantNotification';
import config from '../../../src/config';
import Restaurant, { IRestaurant } from '../../../src/models/Restaurant';
import mockAdminRestoUser from '../../mock/adminResto';
import RestaurantNotification from '../../../src/models/RestaurantNotification';

describe('test createRestaurantNotification', () => {
  beforeAll(async () => {
    await mongoose.connect(config.urlDb);

    await Restaurant.create(mockAdminRestoUser);
  });

  afterAll(async () => {
    await Restaurant.deleteMany({})
    await mongoose.connection.close();
  });
  // error
  describe('error test', () => {
    afterEach(async () => {
      await RestaurantNotification.deleteMany({});
    });
    // should throw error Error 'biar nanti jadi server error'
    it('should throw error Error \'biar nanti jadi server error\'', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant; 

      const mockupNotificationParams = {
        customerUsername: 'hidayahapriliansyah',
        redirectLink: 'http://mocklink',
        type: 'accepted_orderdfgdfgdf',
        restaurantId: restaurantId.toString(),
      };
      await expect(() => createRestaurantNotification({
        customerUsername: mockupNotificationParams.customerUsername,
        redirectLink: mockupNotificationParams.redirectLink,
        type: mockupNotificationParams.type as 'accepted_order',
        restaurantId: mockupNotificationParams.restaurantId,
      })).rejects.toThrow(Error);

      try {
        await createRestaurantNotification({
          customerUsername: mockupNotificationParams.customerUsername,
          redirectLink: mockupNotificationParams.redirectLink,
          type: mockupNotificationParams.type as 'accepted_order',
          restaurantId: mockupNotificationParams.restaurantId,
        })
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Something when wrong due to create notification.');
      }
    });
  });
  // success
  describe('success test', () => {
    afterEach(async () => {
      await RestaurantNotification.deleteMany({})
    });
    it('should valid create restaurant notification with type \'accepted_order\'', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant; 

      const mockupNotificationParams = {
        customerUsername: 'hidayahapriliansyah',
        redirectLink: 'http://mocklink',
        type: 'accepted_order',
        restaurantId: restaurantId.toString(),
      };
      const createdNotification = await createRestaurantNotification({
        customerUsername: mockupNotificationParams.customerUsername,
        redirectLink: mockupNotificationParams.redirectLink,
        type: mockupNotificationParams.type as 'accepted_order',
        restaurantId: mockupNotificationParams.restaurantId,
      });
      const findCreatedNotification = await RestaurantNotification.findById(createdNotification);

      expect(mongoose.Types.ObjectId.isValid(createdNotification.toString())).toBe(true);
      expect(findCreatedNotification!.description).toBe(`Pesanan dari @${mockupNotificationParams.customerUsername} telah diterima. Jangan lupa buat proses pesananannya ya!`);
      expect(findCreatedNotification!.title).toBe('Pesanan Diterima');
      expect(findCreatedNotification!.restaurantId.toString()).toBe(mockupNotificationParams.restaurantId);
      expect(findCreatedNotification!.redirectLink).toBe(mockupNotificationParams.redirectLink);
    });
    it('should valid create restaurant notification with type \'user_review\'', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant; 

      const mockupNotificationParams = {
        customerUsername: 'hidayahapriliansyah',
        redirectLink: 'http://mocklink',
        type: 'user_review',
        restaurantId: restaurantId.toString(),
      };
      const createdNotification = await createRestaurantNotification({
        customerUsername: mockupNotificationParams.customerUsername,
        redirectLink: mockupNotificationParams.redirectLink,
        type: mockupNotificationParams.type as 'user_review',
        restaurantId: mockupNotificationParams.restaurantId,
      });
      const findCreatedNotification = await RestaurantNotification.findById(createdNotification);

      expect(mongoose.Types.ObjectId.isValid(createdNotification.toString())).toBe(true);
      expect(findCreatedNotification!.description).toBe(`@${mockupNotificationParams.customerUsername} telah memberikan ulasan! Yuk lihat apa yang dia katakan.`);
      expect(findCreatedNotification!.title).toBe('Ulasan Baru!');
      expect(findCreatedNotification!.restaurantId.toString()).toBe(mockupNotificationParams.restaurantId);
      expect(findCreatedNotification!.redirectLink).toBe(mockupNotificationParams.redirectLink);
    });
  });
});
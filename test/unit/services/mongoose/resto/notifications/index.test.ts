import mongoose from 'mongoose';
import config from '../../../../../../src/config';
import Restaurant, { IRestaurant } from '../../../../../../src/models/Restaurant';
import mockAdminRestoUser from '../../../../../mock/adminResto';
import createRestaurantNotification from '../../../../../../src/utils/createRestaurantNotification';
import RestaurantNotification from '../../../../../../src/models/RestaurantNotification';

import * as notificationService from '../../../../../../src/services/mongoose/resto/notifications';
import * as DTO from '../../../../../../src/services/mongoose/resto/notifications/types';
import { Request } from 'express';
import { BadRequest, NotFound } from '../../../../../../src/errors';

describe('Notification test', () => { 
  beforeAll(async () => {
    await mongoose.connect(config.urlDb);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const restaurant = await Restaurant.create({
      username: mockAdminRestoUser.username,
      name: mockAdminRestoUser.name,
      email: mockAdminRestoUser.email,
      password: mockAdminRestoUser.password,
    });

    await createRestaurantNotification({
      customerUsername: 'hellohidayah',
      redirectLink: 'https://mocklink.com/mock',
      restaurantId: restaurant._id.toString(),
      type: 'accepted_order',
    });
    await createRestaurantNotification({
      customerUsername: 'hellohidayah',
      redirectLink: 'https://mocklink.com/mock',
      restaurantId: restaurant._id.toString(),
      type: 'user_review',
    });
    await createRestaurantNotification({
      customerUsername: 'adimuhamadfirmansyah',
      redirectLink: 'https://mocklink.com/mock',
      restaurantId: restaurant._id.toString(),
      type: 'accepted_order',
    });
    await createRestaurantNotification({
      customerUsername: 'adimuhamadfirmansyah',
      redirectLink: 'https://mocklink.com/mock',
      restaurantId: restaurant._id.toString(),
      type: 'user_review',
    });
  });

  afterEach(async () => {
    await Restaurant.deleteMany({});
    await RestaurantNotification.deleteMany({});
  });

  // test getAllNotifications
  describe('test getAllNotifications', () => { 
    // error
    // should throw error BadRequest if limit query is not number of string
    it('should throw error BadRequest if limit query is not number of string', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

      const req = {
        user: { _id: restaurantId },
        query: {
          limit: 'dfdfdfdf',
        },
      } as unknown as Request;

      await expect(() => notificationService.getAllNotifications(req)).rejects.toThrow(BadRequest);

      try {
        await notificationService.getAllNotifications(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequest);
        expect(error.message).toBe('Invalid Request. Please check your input data.');
      }
    });
    // should throw error BadRequest if page query is not number of string
    it('should throw error BadRequest if page query is not number of string', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

      const req = {
        user: { _id: restaurantId },
        query: {
          page: 'dfdfdfdf',
        },
      } as unknown as Request;

      await expect(() => notificationService.getAllNotifications(req)).rejects.toThrow(BadRequest);

      try {
        await notificationService.getAllNotifications(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequest);
        expect(error.message).toBe('Invalid Request. Please check your input data.');
      }
    });
    // should throw error BadRequest if read is not '0' or '1'
    it('should throw error BadRequest if read is not \'0\' or \'1\'', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

      const req = {
        user: { _id: restaurantId },
        query: {
          read: '2',
        },
      } as unknown as Request;

      await expect(() => notificationService.getAllNotifications(req)).rejects.toThrow(BadRequest);

      try {
        await notificationService.getAllNotifications(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequest);
        expect(error.message).toBe('Invalid Request. Please check your input data.');
      }
    });
    // should throw error BadRequest if page param is bigger than total page
    it('should throw error BadRequest if page param is bigger than total page', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

      const req = {
        user: { _id: restaurantId },
        query: {
          limit: '10',
          page: '2',
        },
      } as unknown as Request;

      await expect(() => notificationService.getAllNotifications(req)).rejects.toThrow(BadRequest);

      try {
        await notificationService.getAllNotifications(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequest);
        expect(error.message).toBe('Input page is bigger than total pages. Please check your page query.');
      }
    });
    // success
    // should return valid data with empty query
    it('should return valid data with empty query', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

      const req = {
        user: { _id: restaurantId },
        query: {},
      } as unknown as Request;

      const notifcations =
        await notificationService.getAllNotifications(req) as DTO.GetNotificationsWithPaginated;

      expect(notifcations.pages).toBe(1);
      expect(notifcations.total).toBe(4);
      expect(notifcations.notifications).toHaveLength(4);
      expect(notifcations.notifications[0]).toHaveProperty('_id');
      expect(notifcations.notifications[0]).toHaveProperty('createdAt');
      expect(notifcations.notifications[0]).toHaveProperty('isRead');
      expect(notifcations.notifications[0]).toHaveProperty('title');
    });
    // should return valid data with limit, page and read query
    it('should return valid data with limit, page and read query', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
      const updateStatusNotificationTarget = await RestaurantNotification.findOne();
      await RestaurantNotification.findByIdAndUpdate(
        updateStatusNotificationTarget!._id,
        { isRead: true },
      );

      const req = {
        user: { _id: restaurantId },
        query: {
          limit: '2',
          page: '2',
          read: '0',
        },
      } as unknown as Request;

      const notifcations =
        await notificationService.getAllNotifications(req) as DTO.GetNotificationsWithPaginated;

      expect(notifcations.pages).toBe(2);
      expect(notifcations.total).toBe(3);
      expect(notifcations.notifications).toHaveLength(1);
      expect(notifcations.notifications[0]).toHaveProperty('_id');
      expect(notifcations.notifications[0]).toHaveProperty('createdAt');
      expect(notifcations.notifications[0]).toHaveProperty('isRead');
      expect(notifcations.notifications[0]).toHaveProperty('title');
    });
  });
  // test updateRestaurantNotificationReadStatus
  describe('test updateRestaurantNotificationReadStatus', () => { 
    // error
    // should throw error BadRequest if notificationId param is undefined
    it('should throw error BadRequest if notificationId param is undefined', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

      const req = {
        user: { _id: restaurantId },
        params: {},
      } as unknown as Request;

      await expect(() =>notificationService.updateRestaurantNotificationReadStatus(req))
        .rejects.toThrow(BadRequest);

      try {
        await notificationService.updateRestaurantNotificationReadStatus(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(BadRequest);
        expect(error.message)
          .toBe('Invalid Request. notificationId params is undefined. Please check your input data.');
      }
    });
    // should throw error NotFound if notificationId params (objectId) is not found
    it('should throw error NotFound if notificationId params (objectId) is not found', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

      const req = {
        user: { _id: restaurantId },
        params: {
          notificationId: '617a9c4e8a0f133bb2e354a2',
        },
      } as unknown as Request;

      await expect(() =>notificationService.updateRestaurantNotificationReadStatus(req))
        .rejects.toThrow(NotFound);

      try {
        await notificationService.updateRestaurantNotificationReadStatus(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(NotFound);
        expect(error.message)
          .toBe('Notification Id is not found. Please input valid notification id.');
      }
    });
    // should throw error NotFound if notificationId params (random string) is not found
    it('should throw error NotFound if notificationId params (random string) is not found', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

      const req = {
        user: { _id: restaurantId },
        params: {
          notificationId: 'sdsdsd',
        },
      } as unknown as Request;

      await expect(() =>notificationService.updateRestaurantNotificationReadStatus(req))
        .rejects.toThrow(NotFound);

      try {
        await notificationService.updateRestaurantNotificationReadStatus(req);
      } catch (error: any) {
        expect(error).toBeInstanceOf(NotFound);
        expect(error.message)
          .toBe('Notification Id is not found. Please input valid notification id.');
      }
    });
    // success
    // should return _id of updated notification
    it('should return _id of updated notification', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
      const updateStatusNotificationTarget = await RestaurantNotification.findOne();

      const req = {
        user: { _id: restaurantId },
        params: {
          notificationId: updateStatusNotificationTarget!._id.toString(),
        },
      } as unknown as Request;

      const updatedNotification = await notificationService.updateRestaurantNotificationReadStatus(req);
      const checkUpdatedNotification = await RestaurantNotification.findById(updatedNotification);

      expect(updateStatusNotificationTarget!.isRead).toBe(false);
      expect(mongoose.Types.ObjectId.isValid(updatedNotification.toString())).toBe(true);
      expect(checkUpdatedNotification!.isRead).toBe(true);
    });
  });
  // test updateAllRestaurantNotificationReadStatus
  describe('test updateAllRestaurantNotificationReadStatus', () => {
    // success
    // should update all unread notfication status becoming read
    it('should update all unread notfication status becoming read', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
      const updateStatusNotificationTarget = await RestaurantNotification.find({
        restaurantId,
        isRead: false,
      });

      const req = {
        user: { _id: restaurantId },
      } as unknown as Request;

      await notificationService.updateAllRestaurantNotificationReadStatus(req);

      const checkUpdatedNotification = await RestaurantNotification.find({
        restaurantId,
        isRead: true,
      });

      expect(updateStatusNotificationTarget).toHaveLength(4);
      expect(checkUpdatedNotification).toHaveLength(4);
    });
  });
  // test getTotalUnreadRestaurantNotifications
  describe('test getTotalUnreadRestaurantNotifications', () => { 
    // success
    // should return number of unread notifications
    it('should return number of unread notifications', async () => {
      const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
      const updateStatusNotificationTarget = await RestaurantNotification.findOne();
      await RestaurantNotification.findOneAndUpdate(
        { _id: updateStatusNotificationTarget!._id, restaurantId },
        { isRead: true },
      );
      const req = {
        user: { _id: restaurantId }
      } as unknown as Request;

      const unreadNotifications = await notificationService.getTotalUnreadRestaurantNotifications(req);

      expect(unreadNotifications).toBe(3);
    });
  });
});
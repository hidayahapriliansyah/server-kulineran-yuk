import { Request } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { signupForm } from '../../../../../src/services/mongoose/resto/auth';
import config from '../../../../../src/config';
import Restaurant, { IRestaurant } from '../../../../../src/models/Restaurant';
import { MongoServerError } from 'mongodb';
import RestaurantVerification from '../../../../../src/models/RestaurantVerification';
import moment from 'moment';

describe('signupForm Resto', () => {
  describe('validation error input field scenario', () => {
    describe('username field', () => {
      // should return validation error if username field is undefined
      it('should return validation error if username field is undefined', async () => {
        const req = { body: {} } as unknown as Request;
        try {
          await signupForm(req);
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
        const req = { body: { username: '' } } as unknown as Request;
        try {
          await signupForm(req);
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
        const req = {
          body: {
            username: 'werrt-',
          },
        } as unknown as Request;
        try {
          await signupForm(req);
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
      it('should return validation error if username has invalid character', async () => {
        const req = {
          body: {
            username: 'us',
          },
        } as unknown as Request;

        try {
          await signupForm(req);
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
      it('should return validation error if username has invalid character', async () => {
        const req = {
          body: {
            username:
              'usrererhdjfh0000000000000000dddddQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ',
          },
        } as unknown as Request;
        try {
          await signupForm(req);
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
      // should return validation error if name field is undefined
      it('should return validation error if name field is undefined', async () => {
        const req = { body: {} } as unknown as Request;
        try {
          await signupForm(req);
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
        const req = { body: { name: '' } } as unknown as Request;
        try {
          await signupForm(req);
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
        const req = { body: { name: ')(=+}{' } } as unknown as Request;
        try {
          await signupForm(req);
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
        const req = { body: { name: 's' } } as unknown as Request;
        try {
          await signupForm(req);
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
        const req = {
          body: {
            name: 'sdfjgkdfgdfhgkjdfhgkjdfkghdfjkgkdjfhgkjdfhgjkdfguerty968934534593499938475347534587345739457394857394589347593845938475345734957394573498573945734985734573949.-_,',
          },
        } as unknown as Request;
        try {
          await signupForm(req);
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
      // should return validation error if password field is undefined
      it('should return validation error if password field is undefined', async () => {
        const req = { body: {} } as unknown as Request;
        try {
          await signupForm(req);
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
        const req = { body: { password: '' } } as unknown as Request;
        try {
          await signupForm(req);
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
        const req = { body: { password: '7894f' } } as unknown as Request;
        try {
          await signupForm(req);
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

    describe('email field', () => {
      // should return validation error if email field is undefined
      it('should return validation error if email field is undefined', async () => {
        const req = { body: {} } as unknown as Request;
        try {
          await signupForm(req);
        } catch (error: any | ZodError) {
          expect(error).toBeInstanceOf(ZodError);
          expect(
            error.issues.map((issue: { path: string[] }) => issue.path[0])
          ).toContain('email');
          const emailValidationError = error.issues.filter(
            (issue: { path: string[] }) => issue.path[0] === 'email'
          )[0];
          expect(emailValidationError.message).toBe('Required');
        }
      });
      // should return validation error if email field is empty
      it('should return validation error if email field is empty', async () => {
        const req = { body: { email: '' } } as unknown as Request;
        try {
          await signupForm(req);
        } catch (error: any | ZodError) {
          expect(error).toBeInstanceOf(ZodError);
          expect(
            error.issues.map((issue: { path: string[] }) => issue.path[0])
          ).toContain('email');
          const emailValidationError = error.issues.filter(
            (issue: { path: string[] }) => issue.path[0] === 'email'
          )[0];
          expect(emailValidationError.message).toBe('Invalid email');
        }
      });
      // should return validation error if email has invalid character
      it('should return validation error if email has invalid character', async () => {
        const req = { body: { email: '/dfdf&^' } } as unknown as Request;
        try {
          await signupForm(req);
        } catch (error: any | ZodError) {
          expect(error).toBeInstanceOf(ZodError);
          expect(
            error.issues.map((issue: { path: string[] }) => issue.path[0])
          ).toContain('email');
          const emailValidationError = error.issues.filter(
            (issue: { path: string[] }) => issue.path[0] === 'email'
          )[0];
          expect(emailValidationError.message).toBe('Invalid email');
        }
      });
      // should return validation error if email has more than 254 character
      it('should return validation error if email has  more than 254 character', async () => {
        const req = {
          body: {
            email:
              'jdfhgjghdfjghjdfgdfhgjdfhgjhdfghdjfgjdfhgjfdhgjdfhgjdfhgjdhfgdfjghdjfgdfhgjfdgjdfhgjdfhgjdfhgdfjgjdfhgjdfhgjdhfghdfjgdfgdfhgjdgdfhghdfjghjdfgjdfgjdfhgjdfhgjdfhjfjfghfjgjdfhgjdfhdfhghdfjgjdfgjdfgdfhgjgdfhgjhdfghdfjghdjfgdjfghjdfgdfjghdjfghjdfhghdfjdufhduhfdufhdufhdufhudfhdufhudhfudhfudhfudhfsdgfuysgdfusgdfuysgdfuysgdfusdfgusdyfgsudfgusdygfusygfusdgfusgdfusgfusgdfuysdgfuydgsfuysdgfusdgfusdyfgusdygfusdgfusydfgusdygfusydfgusydgfuydfgusdyfgusdyfguysdfgusydfuysdgfudyfguydfuydsfgusdyfgsudgfusdfgsuyg@gmail.com',
          },
        } as unknown as Request;
        try {
          await signupForm(req);
        } catch (error: any | ZodError) {
          expect(error).toBeInstanceOf(ZodError);
          expect(
            error.issues.map((issue: { path: string[] }) => issue.path[0])
          ).toContain('email');
          const emailValidationError = error.issues.filter(
            (issue: { path: string[] }) => issue.path[0] === 'email'
          )[0];
          expect(emailValidationError.message).toBe(
            'String must contain at most 254 character(s)'
          );
        }
      });
    });
  });

  describe('signup + create verification success and duplicate email or username scenario', () => {
    beforeAll(async () => {
      await mongoose.connect(config.urlDb);
    });

    afterAll(async () => {
      await Restaurant.deleteMany({});
      await RestaurantVerification.deleteMany({});
      await mongoose.connection.close();
    });

    // should return restaurant and restaurant verification after signup
    it('should return restaurant and restaurant verification after signup', async () => {
      const username = 'hello123';
      const name = 'Hello Hidayah';
      const email = 'hidayahapriliansyah@gmail.com';
      const password = '123456789';

      const req = {
        body: {
          username,
          name,
          email,
          password,
        },
      } as unknown as Request;
      const result = await signupForm(req);
      expect(result).toHaveProperty('_id');

      const restaurant = await Restaurant.findById(result);
      expect(restaurant!.passMinimumProfileSetting).toBe(true);
      expect(restaurant!.username).toBe(username);
      expect(restaurant!.name).toBe(name);
      expect(restaurant!.email).toBe(email);

      const restaurantVerification = await RestaurantVerification.findOne({
        restaurantId: result,
      });
      expect(restaurantVerification!.email).toBe(restaurant!.email);

      const comparingTime =
        moment(restaurantVerification!.expiredAt).isSame(
          moment(restaurant!.createdAt).add(10, 'minutes'),
          'minutes'
        );
      expect(comparingTime).toBe(true);
    });

    // should give mongoerror if email is already exist
    it('should give mongoerror if email is already exist', async () => {
      const username = 'hello123new';
      const name = 'Hello Hidayah';
      const email = 'hidayahapriliansyah@gmail.com';
      const password = '123456789';

      try {
        const req = {
          body: {
            username,
            name,
            email,
            password,
          },
        } as unknown as Request;
        await signupForm(req);
      } catch (error: unknown) {
        expect((error as MongoServerError).code).toBe(11000);
        expect((error as MongoServerError).keyValue).toHaveProperty('email');
      }
    });

    // should give mongoerror if username is already exist
    it('should give mongoerror if username is already exist', async () => {
      const username = 'hello123';
      const name = 'Hello Hidayah';
      const email = 'hidayahapriliansyahnew@gmail.com';
      const password = '123456789';

      try {
        const req = {
          body: {
            username,
            name,
            email,
            password,
          },
        } as unknown as Request;
        await signupForm(req);
      } catch (error: unknown) {
        expect((error as MongoServerError).code).toBe(11000);
        expect((error as MongoServerError).keyValue).toHaveProperty('username');
      }
    });
  });
});

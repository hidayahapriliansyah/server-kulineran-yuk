import passportGoogleOauth20 from 'passport-google-oauth20';
import { PassportStatic } from 'passport';
import { nanoid } from 'nanoid';
import _ from 'lodash';

import { Restaurant, Customer } from '@prisma/client';
import config from '../../config';
import prisma from '../../db';

const GoogleStrategy = passportGoogleOauth20.Strategy;

const resto = (passport: PassportStatic) => {
  passport.use(
    new GoogleStrategy({
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: config.googleOauthCallbackUrl,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done): Promise<void> => {
      try {
        if (profile.emails && profile.emails.length > 0) {
          const existingUser = await prisma.restaurant.findUnique({
            where: {
              email: profile.emails[0].value,
            },
          });

          if (existingUser) {
            const { isVerified: existingUserIsVerified } = existingUser;
            if (!existingUserIsVerified) {
              const updatedExistingUser = await prisma.restaurant.update({
                where: { id: existingUser.id },
                data: { isVerified: true },
              });
              return done(null, updatedExistingUser!);
            }
            return done(null, existingUser);
          } else {
            type signupGooglePayload = {
              name: string;
              username: string;
              email: string;
            } & Pick<Restaurant, 'passMinimumProfileSetting' | 'isVerified'>

            const payload: signupGooglePayload = {
              name: profile.displayName,
              username: _.replace(_.toLower(profile.displayName + nanoid(7)),
                /[^a-z0-9]/g,
                ''
              ),
              email: profile.emails[0].value,
              passMinimumProfileSetting: false,
              isVerified: true,
            }

            const newUser = await prisma.restaurant.create({
              data: payload,
            });
            return done(null, newUser);
          }
        }
        throw new Error('profile.emails is undefined');
      } catch (error: any) {
        return done(null, error);
      }
    })
  );
};

const customer = (passport: PassportStatic) => {
  passport.use(
    new GoogleStrategy({
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: config.googleOauthCallbackUrl,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done): Promise<void> => {
      try {
        if (profile.emails && profile.emails.length > 0) {
          const existingUser = await prisma.customer.findUnique({
            where: { email: profile.emails[0].value },
          });

          if (existingUser) {
            const { isVerified: existingUserIsVerified } = existingUser;
            if (!existingUserIsVerified) {
              const updatedExistingUser = await prisma.customer.update({
                where: { id: existingUser.id },
                data: { isVerified: true },
              });
              return done(null, updatedExistingUser!);
            }
            return done(null, existingUser);
          } else {
            type signupGooglePayload = {
              name: string;
              username: string;
              email: string;
            } & Pick<Customer, 'isVerified'>

            const payload: signupGooglePayload = {
              name: profile.displayName,
              username: _.replace(_.toLower(profile.displayName + nanoid(7)),
                /[^a-z0-9]/g,
                ''
              ),
              email: profile.emails[0].value,
              isVerified: true,
            }

            const newUser = await prisma.customer.create({ data: payload });
            return done(null, newUser);
          }
        }
        throw new Error('profile.emails is undefined');
      } catch (error: any) {
        return done(null, error);
      }
    })
  );
};

export {
  resto,
  customer,
};

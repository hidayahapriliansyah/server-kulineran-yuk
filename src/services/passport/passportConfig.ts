import passportGoogleOauth20 from 'passport-google-oauth20';
import { PassportStatic } from 'passport';
import { nanoid } from 'nanoid';
import _ from 'lodash';

import config from '../../config';
import Restaurant, { IRestaurant } from '../../models/Restaurant';
import Customer, { ICustomer } from '../../models/Customer';

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
          const existingUser = await Restaurant.findOne({ email: profile.emails[0].value });

          if (existingUser) {
            const { isVerified: existingUserIsVerified } = existingUser;
            if (!existingUserIsVerified) {
              const updatedExistingUser = 
                await Restaurant.findByIdAndUpdate(existingUser._id, { isVerified: true });
              return done(null, updatedExistingUser!);
            }
            return done(null, existingUser);
          } else {
            type signupGooglePayload = {
              name: string;
              username: string;
              email: string;
            } & Pick<IRestaurant, 'passMinimumProfileSetting' | 'isVerified'>

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

            const newUser = await Restaurant.create(payload);
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
          const existingUser = await Customer.findOne({ email: profile.emails[0].value });

          if (existingUser) {
            const { isVerified: existingUserIsVerified } = existingUser;
            if (!existingUserIsVerified) {
              const updatedExistingUser = 
                await Customer.findByIdAndUpdate(existingUser._id, { isVerified: true });
              return done(null, updatedExistingUser!);
            }
            return done(null, existingUser);
          } else {
            type signupGooglePayload = {
              name: string;
              username: string;
              email: string;
            } & Pick<ICustomer, 'isVerified'>

            const payload: signupGooglePayload = {
              name: profile.displayName,
              username: _.replace(_.toLower(profile.displayName + nanoid(7)),
                /[^a-z0-9]/g,
                ''
              ),
              email: profile.emails[0].value,
              isVerified: true,
            }

            const newUser = await Customer.create(payload);
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

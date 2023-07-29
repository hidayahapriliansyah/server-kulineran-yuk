import dotenv from 'dotenv';
dotenv.config();

export default {
  urlDb: process.env.MONGODB_URL as string,
  port: process.env.PORT as string,
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  googleOauthCallbackUrl: process.env.GOOGLE_OAUTH_CALLBACK_URL as string,
};

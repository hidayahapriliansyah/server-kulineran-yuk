import dotenv from 'dotenv';
dotenv.config();

export default {
  // server and database
  urlDb: process.env.MONGODB_URL_LOCAL as string,
  port: process.env.PORT as string,
  // google oauth
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  googleOauthCallbackUrl: process.env.GOOGLE_OAUTH_CALLBACK_URL as string,
  // jwt
  restoAccessTokenCookieName: process.env.RESTO_ACCESS_TOKEN_COOKIE_NAME as string,
  customerAccessTokenCookieName: process.env.CUSTOMER_ACCESS_TOKEN_COOKIE_NAME as string,
  restoIDTokenCookieName: process.env.RESTO_ID_TOKEN_COOKIE_NAME as string,
  customerIDTokenCookieName: process.env.CUSTOMER_ID_TOKEN_COOKIE_NAME as string,
  restoJWTSecretAccessToken: process.env.RESTO_JWT_SECRET_ACCESS_TOKEN as string,
  customerJWTSecretAccessToken: process.env.CUSTOMER_JWT_SECRET_ACCESS_TOKEN as string,
  restoJWTSecretIDToken: process.env.RESTO_JWT_SECRET_ID_TOKEN as string,
  customerJWTSecretIDToken: process.env.CUSTOMER_JWT_SECRET_ID_TOKEN as string,
  jwtExpiration: '24h',
  jwtRefrestTokenExpiration: '7d',
  // nodemailer
  googleEmailSender: process.env.GOOGLE_EMAIL_SENDER as string,
  googleAppPassword: process.env.GOOGLE_APP_PASSWORD as string
};

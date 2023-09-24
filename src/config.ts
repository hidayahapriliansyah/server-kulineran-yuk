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
  restoIDTokenLocalStorageKeyName: process.env.RESTO_ID_TOKEN_LOCAL_STORAGE_KEY_NAME as string,
  customerIDTokenLocalStorageKeyName: process.env.CUSTOMER_ID_TOKEN_LOCAL_STORAGE_KEY_NAME as string,
  restoJWTSecretAccessToken: process.env.RESTO_JWT_SECRET_ACCESS_TOKEN as string,
  customerJWTSecretAccessToken: process.env.CUSTOMER_JWT_SECRET_ACCESS_TOKEN as string,
  restoJWTSecretIDToken: process.env.RESTO_JWT_SECRET_ID_TOKEN as string,
  customerJWTSecretIDToken: process.env.CUSTOMER_JWT_SECRET_ID_TOKEN as string,
  restoRefreshTokenLocalStorageKeyName: process.env.RESTO_REFRESH_TOKEN_LOCAL_STORAGE_KEY_NAME as string,
  customerRefreshTokenLocalStorageKeyName: process.env.RESTO_REFRESH_TOKEN_LOCAL_STORAGE_KEY_NAME as string,
  restoJWTSecretRefreshToken: process.env.RESTO_JWT_SECRET_REFRESH_TOKEN as string,
  customerJWTSecretRefreshToken: process.env.CUSTOMER_JWT_SECRET_REFRESH_TOKEN as string,
  jwtExpiration: '24h',
  jwtRefreshTokenExpiration: '14d',
  // nodemailer
  googleEmailSender: process.env.GOOGLE_EMAIL_SENDER as string,
  googleAppPassword: process.env.GOOGLE_APP_PASSWORD as string
};

// restoIDTokenCookieName: process.env.RESTO_ID_TOKEN_COOKIE_NAME as string,
// customerIDTokenCookieName: process.env.CUSTOMER_ID_TOKEN_COOKIE_NAME as string,

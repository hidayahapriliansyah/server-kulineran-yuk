import dotenv from 'dotenv';
dotenv.config();

export default {
  urlDb: process.env.MONGODB_URL as string,
  port: process.env.PORT as string,
};

import { connect as mongooseConnect, connection as mongooseConnection } from 'mongoose';
import config from '../config';

mongooseConnect(config.urlDb as string);
const db = mongooseConnection;

export default db;

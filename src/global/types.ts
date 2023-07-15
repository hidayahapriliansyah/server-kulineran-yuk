import { ObjectId, Document } from 'mongoose';

export interface DocumentWithIdObjectId extends Document {
  _id: ObjectId,
}

export interface TimestampsDocument extends DocumentWithIdObjectId {
  createdAt: Date;
  updatedAt: Date;
}
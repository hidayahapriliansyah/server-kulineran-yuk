import { ObjectId, Document } from 'mongoose';

export interface DocumentWithIdObjectId extends Document {
  _id: ObjectId;
}

export interface TimestampsDocument extends DocumentWithIdObjectId {
  createdAt: Date;
  updatedAt: Date;
}

abstract class APIResponse {
  constructor(public readonly success: boolean, public readonly message: string) {}
}

export class SuccessAPIResponse extends APIResponse {
  constructor(message: string, public readonly data?: {} | []) {
    super(true, message);
  }
}

export class ErrorAPIResponse extends APIResponse {
  constructor(message: string) {
    super(false, message);
  }
}

export class ValidationErrorAPIResponse extends ErrorAPIResponse {
  constructor(message: string, public readonly errors: { message: string; field: string }[]) {
    super(message);
  }
}

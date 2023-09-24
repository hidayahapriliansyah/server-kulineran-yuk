import { StatusCodes } from 'http-status-codes';  
import CustomAPIError from './CustomAPIError';

class BadRequest extends CustomAPIError {
  statusCode = StatusCodes.BAD_REQUEST;
  constructor(message: string) {
    super(message);

    this.name = 'BadRequestError';
  }
}

export default BadRequest;

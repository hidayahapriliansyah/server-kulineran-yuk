import { StatusCodes } from 'http-status-codes';  
import CustomAPIError from './CustomAPIError';

class BadRequest extends CustomAPIError {
  statusCode = StatusCodes.BAD_REQUEST;
  constructor(message: string) {
    super(message);

    this.name = 'Bad Request - API';
  }
}

export default BadRequest;

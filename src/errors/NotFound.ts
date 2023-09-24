import { StatusCodes } from 'http-status-codes';  
import CustomAPIError from './CustomAPIError';

class NotFound extends CustomAPIError {
  statusCode = StatusCodes.NOT_FOUND;
  constructor(message: string) {
    super(message);

    this.name = 'NotFoundError';
  }
}

export default NotFound;

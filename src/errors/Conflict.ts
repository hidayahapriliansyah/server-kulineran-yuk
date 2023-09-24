import { StatusCodes } from 'http-status-codes';  
import CustomAPIError from './CustomAPIError';

class Conflict extends CustomAPIError {
  statusCode = StatusCodes.CONFLICT;
  constructor(message: string) {
    super(message);

    this.name = 'ConflictError';
  }
}

export default Conflict;

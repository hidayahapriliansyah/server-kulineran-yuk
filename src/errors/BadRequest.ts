import { StatusCodes } from 'http-status-codes';  
import CustomAPIError from './CustomAPIError';

class BadRequest extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.name = 'Bad Request - API';
  }
}

export default BadRequest;

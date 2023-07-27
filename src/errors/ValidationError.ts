import { StatusCodes } from 'http-status-codes';  
import CustomAPIError from './CustomAPIError';

class ValidationError extends CustomAPIError {
  errors: any;
  statusCode = StatusCodes.BAD_REQUEST;
  constructor(message: string, errors: any) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export default ValidationError;

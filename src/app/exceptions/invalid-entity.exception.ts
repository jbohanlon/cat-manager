import { HttpException, HttpStatus, ValidationError } from '@nestjs/common';

export class InvalidEntityException extends HttpException {
  constructor(validationErrors: ValidationError[]) {
    super({
      message: 'Bad request',
      errors: InvalidEntityException.formatValidationErrors(validationErrors),
    }, HttpStatus.BAD_REQUEST);
  }

  static formatValidationErrors(validationErrors: ValidationError[]) {
    const errorOutput = {};
    validationErrors.forEach((err) => {
      const errorMessages = Object.values(err.constraints);
      errorOutput[err.property] = errorMessages;
    });
    return errorOutput;
  }
}

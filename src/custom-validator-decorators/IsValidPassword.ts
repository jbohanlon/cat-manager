import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

const MIN_PASSWORD_LENGTH = 10;

export function IsValidPassword(passwordIsRequired: boolean) {
  const validationOptions: ValidationOptions = {
    message: `A password is required and it must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  };

  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidPassword',
      target: object.constructor,
      propertyName,
      constraints: [passwordIsRequired],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [passIsRequired] = args.constraints;

          if (value) {
            return value.length >= MIN_PASSWORD_LENGTH;
          }

          return !passIsRequired;
        },
      },
    });
  };
}

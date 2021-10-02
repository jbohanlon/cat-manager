import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function MatchesOtherPropertyValue(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'matchesOtherPropertyValue',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate: (value: any, args: ValidationArguments) => {
          const [otherPropertyName] = args.constraints;
          const otherPropertyValue = (args.object as any)[otherPropertyName];
          return otherPropertyValue === value;
        },
      },
    });
  };
}

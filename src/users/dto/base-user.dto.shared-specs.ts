/* eslint-disable new-cap */
/* eslint-disable jest/no-export */
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { BaseUserDto } from './base-user.dto';

// Note that `new () => BaseUserDto` below is the same as doing `typeof CreateUserDto | typeof PatchUserDto`,
// but it works for any current or future subclass of BaseUserDto.
export const itBehavesLikeABaseUserDto = (transformationClass: new () => BaseUserDto) => {
  describe('inherited BaseUserDto behavior', () => {
    describe('transformation with class-transformer', () => {
      describe('for the isAdmin field', () => {
        [
          { input: true, output: true },
          { input: false, output: false },
          { input: 'true', output: true },
          { input: 'false', output: false },
          { input: 'banana', output: false },
          { input: 5, output: false },
          { input: undefined, output: false },
          { input: null, output: false },
        ].forEach(({ input, output }) => {
          it(`coerces ${input} (${typeof (input)}) to ${output}`, async () => {
            const obj = plainToClass(transformationClass, { isAdmin: input });
            expect(obj).toBeInstanceOf(transformationClass);
            expect(obj.isAdmin).toBe(output);
          });
        });
      });
    });

    describe('validation with class-validator', () => {
      const validatorOptions = { whitelist: true };

      let dto: BaseUserDto;
      beforeEach(() => {
        dto = new transformationClass();
      });

      describe('for the passwordVerification field', () => {
        it('passes validation when password and passwordValidation are present, and the same', async () => {
          dto.password = 'coolpassword';
          dto.passwordVerification = dto.password;
          const validationErrors = await validate(dto, validatorOptions);
          expect(validationErrors).toHaveLength(0);
        });

        it('fails validation when password and passwordValidation are present, and not the same', async () => {
          dto.password = 'coolpassword';
          dto.passwordVerification = `not-${dto.password}`;
          const validationErrors = await validate(dto, validatorOptions);
          expect(validationErrors).toHaveLength(1);
        });
      });

      it('whitelists desired properties', async () => {
        const expectedProperties = {
          email: 'sample@example.com',
          password: 'coolpassword',
          passwordVerification: 'coolpassword',
          isAdmin: false,
        };

        Object.assign(dto, expectedProperties, { extra: 'banana' });
        await validate(dto, validatorOptions);
        expect((dto as any).extra).toBeUndefined();
      });
    });
  });
};

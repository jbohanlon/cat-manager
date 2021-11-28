/* eslint-disable new-cap */
/* eslint-disable jest/no-export */
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { BaseCatDto } from './base-cat.dto';

// Note that `new () => BaseCatDto` below is the same as doing `typeof CreateCatDto | typeof UpdateCatDto`,
// but it works for any current or future subclass of BaseCatDto.
export const itBehavesLikeABaseCatDto = (transformationClass: new () => BaseCatDto) => {
  describe('inherited BaseCatDto behavior', () => {
    describe('transformation with class-transformer', () => {
      describe('for the weight field', () => {
        [
          { input: 10, output: 10 },
          { input: -30, output: -30 },
          { input: '10', output: 10 },
          { input: 'banana', output: NaN },
          { input: false, output: NaN },
          { input: undefined, output: NaN },
          { input: null, output: NaN },
        ].forEach(({ input, output }) => {
          it(`coerces ${input} (${typeof (input)}) to ${output}`, async () => {
            const obj = plainToClass(transformationClass, { weight: input });
            expect(obj).toBeInstanceOf(transformationClass);
            expect(obj.weight).toBe(output);
          });
        });
      });

      describe('for the isFriendly field', () => {
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
            const obj = plainToClass(transformationClass, { isFriendly: input });
            expect(obj).toBeInstanceOf(transformationClass);
            expect(obj.isFriendly).toBe(output);
          });
        });
      });
    });

    describe('validation with class-validator', () => {
      const validatorOptions = { whitelist: true };

      let dto: BaseCatDto;
      beforeEach(() => {
        dto = new transformationClass();
      });

      it('whitelists desired properties', async () => {
        const expectedProperties = {
          name: 'Sample von Cattington',
          weight: 12,
          breed: 'Exemplary',
          isFriendly: true,
        };

        Object.assign(dto, expectedProperties, { extra: 'banana' });
        await validate(dto, validatorOptions);
        expect((dto as any).extra).toBeUndefined();
      });
    });
  });
};

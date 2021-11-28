import { validate } from 'class-validator';
import { itBehavesLikeABaseUserDto } from './base-user.dto.shared-specs';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  let dto: CreateUserDto;

  beforeEach(() => {
    dto = new CreateUserDto();
  });

  describe('a new instance', () => {
    it('can be created successfully', () => {
      expect(dto).toBeInstanceOf(CreateUserDto);
    });
  });

  itBehavesLikeABaseUserDto(CreateUserDto);

  describe('validation with class-validator', () => {
    const validatorOptions = { whitelist: true };

    describe('for the password property', () => {
      it('passes validation when present and at least 10 characters', async () => {
        dto.password = 'coolpassword';
        dto.passwordVerification = dto.password;
        expect(await validate(dto, validatorOptions)).toHaveLength(0);
      });

      it('fails validation when present and has fewer than 10 characters', async () => {
        dto.password = 'cool';
        dto.passwordVerification = dto.password;
        const validationResult = await validate(dto, validatorOptions);
        expect(validationResult).toHaveLength(1);
        expect(validationResult[0].constraints.isValidPassword).toBeTruthy();
      });

      it('fails validation when absent', async () => {
        const validationResult = await validate(dto, validatorOptions);
        expect(validationResult).toHaveLength(1);
        expect(validationResult[0].constraints.isValidPassword).toBeTruthy();
      });
    });
  });
});

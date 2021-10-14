import * as bcrypt from 'bcryptjs';
import { sampleSalt, samplePassword, sampleEncryptedPassword } from '../../../test/helpers/bcryptHelpers';
import { User } from './user.entity';

describe('User', () => {
  describe('#setPassword', () => {
    beforeEach(() => {
      jest.spyOn(bcrypt, 'genSaltSync').mockImplementation((_rounds) => sampleSalt);
    });

    it('sets encryptedPassword to the expected value', () => {
      const user = new User();
      user.setPassword(samplePassword, samplePassword);

      expect(user.encryptedPassword).toEqual(sampleEncryptedPassword);
    });
  });

  describe('#isPasswordMatch', () => {
    const nonMatchingPassword = 'not-banana';

    it('returns true for an expected password match', () => {
      const user = new User();
      user.encryptedPassword = sampleEncryptedPassword;
      expect(user.isPasswordMatch(samplePassword)).toBe(true);
    });

    it('returns false for an expected password mismatch', () => {
      const user = new User();
      user.encryptedPassword = sampleEncryptedPassword;
      expect(user.isPasswordMatch(nonMatchingPassword)).toBe(false);
    });
  });
});

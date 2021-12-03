import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { sampleSalt, samplePassword, sampleEncryptedPassword } from '../../../test/helpers/bcryptHelpers';
import { buildSampleCats } from '../../../test/helpers/catHelpers';
import { clearAllTables } from '../../../test/helpers/repositoryHelpers';
import { buildSampleUser } from '../../../test/helpers/userHelpers';
import { AppModule } from '../../app/app.module';
import { InvalidEntityException } from '../../app/exceptions/invalid-entity.exception';
import { Cat } from '../../cats/entities/cat.entity';
import { CatsService } from '../../cats/providers/cats.service';
import { PasswordMismatchError } from '../../errors/errors';
import { UsersService } from '../providers/users.service';
import { User } from './user.entity';

describe('User', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let usersService: UsersService;
  let catsService: CatsService;
  let user: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    usersService = moduleRef.get<UsersService>(UsersService);
    catsService = moduleRef.get<CatsService>(CatsService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearAllTables(userRepository.manager.connection);
    user = buildSampleUser();
  });

  describe('on save (create or update)', () => {
    let cats: Cat[];

    beforeEach(async () => {
      cats = buildSampleCats();
      user.cats = cats;
      await usersService.create(user);
    });

    it('cascades the save to any new Cat instances assigned to the cats field (and saves the new cats)', async () => {
      expect(cats.filter((cat) => cat.id !== undefined)).toHaveLength(cats.length);
    });

    it('persists all User-Cat relationships to the datastore', async () => {
      const retrievedUser = await usersService.find(user.id, true);
      expect(retrievedUser.cats.map((cat) => cat.id).sort()).toEqual(cats.map((cat) => cat.id).sort());
    });
  });

  describe('#setPassword', () => {
    beforeEach(() => {
      jest.spyOn(bcrypt, 'genSaltSync').mockImplementation((_rounds) => sampleSalt);
    });

    it('sets encryptedPassword to the expected value', () => {
      user.setPassword(samplePassword, samplePassword);
      expect(user.encryptedPassword).toEqual(sampleEncryptedPassword);
    });

    it('throws an error when password and passwordVerification do not match', () => {
      expect(() => { user.setPassword(samplePassword, `not-${samplePassword}`); }).toThrow(PasswordMismatchError);
    });
  });

  describe('#isPasswordMatch', () => {
    const nonMatchingPassword = 'not-banana';

    it('returns true for an expected password match', () => {
      user.encryptedPassword = sampleEncryptedPassword;
      expect(user.isPasswordMatch(samplePassword)).toBe(true);
    });

    it('returns false for an expected password mismatch', () => {
      user.encryptedPassword = sampleEncryptedPassword;
      expect(user.isPasswordMatch(nonMatchingPassword)).toBe(false);
    });
  });

  describe('#validateInstance', () => {
    describe('when email is invalid', () => {
      const invalidValues = [
        undefined,
        null,
        "That's no email!",
      ];

      invalidValues.forEach((invalidValue) => {
        it(`throws an error when email is: ${invalidValue} (${typeof (invalidValue)})`, async () => {
          // @ts-ignore - Force typescript to allow assignment of any test value here
          user.email = invalidValue;
          await expect(user.validateInstance()).rejects.toThrow(InvalidEntityException);
        });
      });
    });
  });

  describe('when a user is deleted', () => {
    beforeEach(async () => {
      user.cats = buildSampleCats();
      await usersService.create(user);
    });

    it('automatically deletes all associated cats', async () => {
      const foundCats = await catsService.findAll();
      expect(foundCats.length).toBeGreaterThan(0);
      expect(foundCats.map((cat) => cat.id).sort()).toEqual(user.cats.map((cat) => cat.id).sort());
      await usersService.delete(user.id);
      expect(await catsService.findAll()).toHaveLength(0);
    });
  });
});

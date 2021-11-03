import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { buildSampleCat } from '../../../test/helpers/catHelpers';
import { clearAllTables } from '../../../test/helpers/repositoryHelpers';
import { buildSampleUser } from '../../../test/helpers/userHelpers';
import { AppModule } from '../../app/app.module';
import { InvalidEntityException } from '../../app/exceptions/invalid-entity.exception';
import { UsersService } from '../../users/providers/users.service';
import { CatsService } from '../providers/cats.service';
import { Cat } from './cat.entity';

describe('Cat', () => {
  let app: INestApplication;
  let catRepository: Repository<Cat>;
  let cat: Cat;
  let catsService: CatsService;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    catRepository = moduleRef.get<Repository<Cat>>(getRepositoryToken(Cat));
    catsService = moduleRef.get<CatsService>(CatsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearAllTables(catRepository.manager.connection);
    cat = buildSampleCat();
    const user = buildSampleUser();
    await usersService.create(user);
    cat.user = user;
  });

  describe('user relation', () => {
    describe('when a user has been assigned to the Cat', () => {
      it('persists that relationship to the datastore', async () => {
        await catsService.create(cat);
        const retrievedCat = await catsService.find(cat.id, true);
        expect(retrievedCat.user.id).toBe(cat.user.id);
      });
    });

    describe('when a user has not been assigned to the cat', () => {
      it('throws an error', async () => {
        cat.user = undefined;
        await expect(catsService.create(cat)).rejects.toThrow(QueryFailedError);
      });
    });
  });

  describe('on create', () => {
    beforeEach(() => {
      jest.spyOn(cat, 'validateInstance');
    });

    it('calls validateInstance', async () => {
      await catsService.create(cat);
      expect(cat.validateInstance).toHaveBeenCalledTimes(1);
    });
  });

  describe('on update', () => {
    beforeEach(async () => {
      await catsService.create(cat);
      jest.spyOn(cat, 'validateInstance');
    });

    it('calls validateInstance', async () => {
      cat.name = 'Whiskers von Cattington';
      await catsService.update(cat);
      expect(cat.validateInstance).toHaveBeenCalledTimes(1);
    });

    describe('when a string id is provided', () => {
      it('does not throw an error when id can be coerced to an integer', async () => {
        // @ts-ignore - Force typescript to allow assignment of any test value here
        cat.id = '99';
        await expect(catsService.update(cat)).resolves.not.toThrow();
      });

      it('throws an error when the id cannot be coerced to an integer', async () => {
        // @ts-ignore - Force typescript to allow assignment of any test value here
        cat.id = 'banana';
        await expect(catsService.update(cat)).rejects.toThrow(QueryFailedError);
      });
    });
  });

  describe('#validateInstance', () => {
    describe('when name is invalid', () => {
      const invalidValues = [
        undefined,
        'a string that is longer than..........................................................max allowed length!',
        true,
      ];

      invalidValues.forEach((invalidValue) => {
        it(`throws an error when name is: ${invalidValue} (${typeof (invalidValue)})`, async () => {
          // @ts-ignore - Force typescript to allow assignment of any test value here
          cat.name = invalidValue;
          await expect(cat.validateInstance()).rejects.toThrow(InvalidEntityException);
        });
      });
    });

    describe('when weight is invalid', () => {
      const invalidValues = [
        undefined,
        -5,
        0,
        0.4,
        '9999',
        'some string',
      ];

      invalidValues.forEach((invalidValue) => {
        it(`throws an error when weight is: ${invalidValue} (${typeof (invalidValue)})`, async () => {
          // @ts-ignore - Force typescript to allow assignment of any test value here
          cat.weight = invalidValue;
          await expect(cat.validateInstance()).rejects.toThrow(InvalidEntityException);
        });
      });
    });

    describe('when breed is invalid', () => {
      const invalidValues = [
        undefined,
        'a string that is longer than..........................................................max allowed length!',
        true,
      ];

      invalidValues.forEach((invalidValue) => {
        it(`throws an error when breed is: ${invalidValue} (${typeof (invalidValue)})`, async () => {
          // @ts-ignore - Force typescript to allow assignment of any test value here
          cat.breed = invalidValue;
          await expect(cat.validateInstance()).rejects.toThrow(InvalidEntityException);
        });
      });
    });

    describe('when isFriendly is invalid', () => {
      const invalidValues = [
        undefined,
        'true',
        'some string',
      ];

      invalidValues.forEach((invalidValue) => {
        it(`throws an error when isFriendly is: ${invalidValue} (${typeof (invalidValue)})`, async () => {
          // @ts-ignore - Force typescript to allow assignment of any test value here
          cat.isFriendly = invalidValue;
          await expect(cat.validateInstance()).rejects.toThrow(InvalidEntityException);
        });
      });
    });
  });
});

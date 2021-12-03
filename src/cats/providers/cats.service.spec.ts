import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { createTestUser } from '../../../test/helpers/authenticationHelpers';
import { buildSampleCat, buildSampleCats } from '../../../test/helpers/catHelpers';
import { clearAllTables } from '../../../test/helpers/repositoryHelpers';
import { AppModule } from '../../app/app.module';
import { InvalidEntityException } from '../../app/exceptions/invalid-entity.exception';
import { EntityCreationError, EntityUpdateError } from '../../errors/errors';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/providers/users.service';
import { Cat } from '../entities/cat.entity';
import { CatsService } from './cats.service';

describe('CatsService', () => {
  let app: INestApplication;
  let catsService: CatsService;
  let catRepository: Repository<Cat>;
  let sampleCats: Cat[];
  let user: User;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    catsService = moduleRef.get<CatsService>(CatsService);
    catRepository = moduleRef.get<Repository<Cat>>(getRepositoryToken(Cat));
    usersService = moduleRef.get<UsersService>(UsersService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearAllTables(catRepository.manager.connection);
    user = await createTestUser(usersService);
    sampleCats = buildSampleCats(user);
  });

  describe('#findAll', () => {
    let expectedCats: Cat[];
    beforeEach(async () => {
      const catPromises = sampleCats.map((cat) => {
        return catsService.create(cat);
      });
      expectedCats = await Promise.all(catPromises);
      expectedCats.sort((a, b) => a.id - b.id);
    });

    it('with includeUser=false (the default param value), finds the expected cats (without users)', async () => {
      expectedCats.forEach((cat) => delete cat.user);
      expect(await catsService.findAll()).toEqual(expectedCats);
    });

    it('with includeUser=true, finds the expected cats (with users)', async () => {
      expect(await catsService.findAll(true)).toEqual(expectedCats);
    });
  });

  describe('#find', () => {
    let cat: Cat;
    beforeEach(async () => {
      cat = await catsService.create(buildSampleCat(user));
    });

    it('with includeUser=false (the default param value), finds the expected cat (without user)', async () => {
      delete cat.user;
      expect(await catsService.find(cat.id)).toEqual(cat);
    });

    it('with includeUser=true, finds the expected cat (with user)', async () => {
      expect(await catsService.find(cat.id, true)).toEqual(cat);
    });
  });

  describe('#exists', () => {
    let cat: Cat;
    beforeEach(async () => {
      cat = await catsService.create(buildSampleCat(user));
    });

    it('returns true for an existing cat', async () => {
      expect(await catsService.exists(cat.id)).toBe(true);
    });

    it('returns false for a nonexistent cat', async () => {
      expect(await catsService.exists(9999)).toBe(false);
    });
  });

  describe('#create', () => {
    it('creates the expected cat', async () => {
      const cat = await catsService.create(buildSampleCat(user));
      expect(await catsService.find(cat.id, true)).toEqual(cat);
    });

    it('calls validateInstance', async () => {
      const cat = buildSampleCat(user);
      jest.spyOn(cat, 'validateInstance');
      await catsService.create(cat);
      expect(cat.validateInstance).toHaveBeenCalledTimes(1);
    });

    it('throws an error when invalid data is provided', async () => {
      const cat = buildSampleCat(user);
      cat.name = undefined;
      await expect(catsService.create(cat)).rejects.toThrow(InvalidEntityException);
    });

    it('throws an error when a cat with an id is provided', async () => {
      const cat = await catsService.create(buildSampleCat(user));
      cat.id = 10;
      await expect(catsService.create(cat)).rejects.toThrow(EntityCreationError);
    });
  });

  describe('#update', () => {
    let cat: Cat;
    beforeEach(async () => {
      cat = await catsService.create(buildSampleCat(user));
    });

    it('updates the expected cat', async () => {
      cat.name = 'Snowball, Destroyer of Worlds';
      await catsService.update(cat);

      expect(await catsService.find(cat.id, true)).toEqual(cat);
    });

    it('calls validateInstance', async () => {
      jest.spyOn(cat, 'validateInstance');
      cat.isFriendly = true;
      await catsService.update(cat);
      expect(cat.validateInstance).toHaveBeenCalledTimes(1);
    });

    it('throws an error when invalid data is provided', async () => {
      cat.name = undefined;
      await expect(catsService.update(cat)).rejects.toThrow(InvalidEntityException);
    });

    it('throws an error when a cat without an id is provided', async () => {
      cat.id = undefined;
      await expect(catsService.update(cat)).rejects.toThrow(EntityUpdateError);
    });
  });

  describe('#delete', () => {
    let cat: Cat;
    beforeEach(async () => {
      cat = await catsService.create(buildSampleCat(user));
    });

    it('deletes a cat', async () => {
      expect(await catsService.exists(cat.id)).toBe(true);
      await catsService.delete(cat.id);
      expect(await catsService.exists(cat.id)).toBe(false);
    });
  });

  describe('#deleteAll', () => {
    beforeEach(async () => {
      const catSavePromises = sampleCats.map((cat) => {
        return catsService.create(cat);
      });
      await Promise.all(catSavePromises);
    });

    it('deletes all cats', async () => {
      expect((await catsService.findAll()).length).toBeGreaterThan(2); // ensure we're deleting more than one cat
      await catsService.deleteAll();
      expect((await catsService.findAll())).toHaveLength(0);
    });
  });

  describe('#generateRandomCatQueryBuilder', () => {
    it('produces the expected query', () => {
      expect(catsService.generateRandomCatQueryBuilder().getSql()).toBe('SELECT id FROM "cat" "Cat" ORDER BY RANDOM() ASC');
    });
  });

  describe('#findRandomId', () => {
    beforeEach(async () => {
      const mockQueryBuilder = { getRawOne: async () => ({ id: 2 }) } as SelectQueryBuilder<Cat>;
      jest.spyOn(catsService, 'generateRandomCatQueryBuilder').mockImplementation(() => mockQueryBuilder);
    });

    it('returns a random cat id', async () => {
      expect(await catsService.findRandomId()).toBe(2);
    });
  });
});

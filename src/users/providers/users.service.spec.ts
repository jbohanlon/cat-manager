import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buildSampleCat } from '../../../test/helpers/catHelpers';
import { clearAllTables } from '../../../test/helpers/repositoryHelpers';
import { buildSampleUser, buildSampleUsers } from '../../../test/helpers/userHelpers';
import { AppModule } from '../../app/app.module';
import { InvalidEntityException } from '../../app/exceptions/invalid-entity.exception';
import { EntityCreationError, EntityUpdateError } from '../../errors/errors';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let sampleUsers: User[];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearAllTables(userRepository.manager.connection);
    sampleUsers = buildSampleUsers();
  });

  describe('#findAll', () => {
    let expectedUsers: User[];
    beforeEach(async () => {
      const userSavePromises = sampleUsers.map((user) => {
        user.cats = [buildSampleCat()];
        return usersService.create(user);
      });
      expectedUsers = await Promise.all(userSavePromises);
      expectedUsers.sort((a, b) => a.id - b.id);
    });

    it('with includeCats=false (the default param value), finds the expected users (without cats)', async () => {
      expectedUsers.forEach((user) => delete user.cats);
      expect(await usersService.findAll()).toEqual(expectedUsers);
    });

    it('with includeCats=true, finds the expected users (with cats)', async () => {
      expect(await usersService.findAll(true)).toEqual(expectedUsers);
    });
  });

  describe('#find', () => {
    let user: User;
    beforeEach(async () => {
      user = buildSampleUser();
      user.cats = [buildSampleCat()];
      await usersService.create(user);
    });

    it('with includeCats=false (the default param value), finds the expected user (without cats)', async () => {
      delete user.cats;
      expect(await usersService.find(user.id)).toEqual(user);
    });

    it('with includeCats=true, finds the expected user (with cats)', async () => {
      expect(await usersService.find(user.id, true)).toEqual(user);
    });
  });

  describe('#findByEmail', () => {
    let user: User;
    beforeEach(async () => {
      user = buildSampleUser();
      user.cats = [buildSampleCat()];
      await usersService.create(user);
    });

    it('with includeCats=false (the default param value), finds the expected user (without cats)', async () => {
      delete user.cats;
      expect(await usersService.findByEmail(user.email)).toEqual(user);
    });

    it('with includeCats=true, finds the expected user (with cats)', async () => {
      expect(await usersService.findByEmail(user.email, true)).toEqual(user);
    });
  });

  describe('#exists', () => {
    let user: User;
    beforeEach(async () => {
      user = await usersService.create(buildSampleUser());
    });

    it('returns true for an existing user', async () => {
      expect(await usersService.exists(user.id)).toBe(true);
    });

    it('returns false for a nonexistent user', async () => {
      expect(await usersService.exists(9999)).toBe(false);
    });
  });

  describe('#create', () => {
    it('creates the expected user', async () => {
      const user = await usersService.create(buildSampleUser());
      expect(await usersService.find(user.id)).toEqual(user);
    });

    it('calls validateInstance', async () => {
      const user = buildSampleUser();
      jest.spyOn(user, 'validateInstance');
      await usersService.create(user);
      expect(user.validateInstance).toHaveBeenCalledTimes(1);
    });

    it('throws an error when invalid data is provided', async () => {
      const user = buildSampleUser();
      user.email = undefined;
      await expect(usersService.create(user)).rejects.toThrow(InvalidEntityException);
    });

    it('throws an error when a User with an id is provided', async () => {
      const user = await usersService.create(buildSampleUser());
      user.id = 10;
      await expect(usersService.create(user)).rejects.toThrow(EntityCreationError);
    });
  });

  describe('#update', () => {
    let user: User;
    beforeEach(async () => {
      user = await usersService.create(buildSampleUser());
    });

    it('updates the expected user', async () => {
      user.email = 'changed@example.com';
      await usersService.update(user);

      expect(await usersService.find(user.id)).toEqual(user);
    });

    it('calls validateInstance', async () => {
      jest.spyOn(user, 'validateInstance');
      user.isAdmin = true;
      await usersService.update(user);
      expect(user.validateInstance).toHaveBeenCalledTimes(1);
    });

    it('throws an error when invalid data is provided', async () => {
      user.email = undefined;
      await expect(usersService.update(user)).rejects.toThrow(InvalidEntityException);
    });

    it('throws an error when a User without an id is provided', async () => {
      user.id = undefined;
      await expect(usersService.update(user)).rejects.toThrow(EntityUpdateError);
    });
  });

  describe('#delete', () => {
    let user: User;
    beforeEach(async () => {
      user = await usersService.create(buildSampleUser());
    });

    it('deletes a user', async () => {
      expect(await usersService.exists(user.id)).toBe(true);
      await usersService.delete(user.id);
      expect(await usersService.exists(user.id)).toBe(false);
    });
  });

  describe('#deleteAll', () => {
    beforeEach(async () => {
      const userSavePromises = sampleUsers.map((user) => {
        return usersService.create(user);
      });
      await Promise.all(userSavePromises);
    });

    it('deletes all users', async () => {
      expect((await usersService.findAll()).length).toBeGreaterThan(2); // ensure we're deleting more than one user
      await usersService.deleteAll();
      expect((await usersService.findAll())).toHaveLength(0);
    });
  });
});

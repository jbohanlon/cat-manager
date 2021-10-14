import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { clearAllTables } from '../../../test/helpers/repositoryHelpers';
import { generateSampleUsers } from '../../../test/helpers/userHelpers';
import { AppModule } from '../../app/app.module';
import { InvalidEntityException } from '../../app/exceptions/invalid-entity.exception';
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
    userRepository = moduleRef.get<Repository<User>>('USER_REPOSITORY');
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearAllTables(userRepository.manager.connection);
    sampleUsers = generateSampleUsers();
  });

  describe('#findAll', () => {
    let userSavePromises;
    beforeEach(async () => {
      userSavePromises = sampleUsers.map((user) => {
        return usersService.save(user);
      });
      await Promise.all(userSavePromises);
    });

    it('finds the expected number of users', async () => {
      expect(await usersService.findAll()).toHaveLength(userSavePromises.length);
    });
  });

  describe('#find', () => {
    let user;
    beforeEach(async () => {
      user = await usersService.save(sampleUsers[0]);
    });

    it('finds the expected user', async () => {
      expect(await usersService.find(user.id)).toEqual(user);
    });
  });

  describe('#findByEmail', () => {
    let user;
    beforeEach(async () => {
      user = await usersService.save(sampleUsers[0]);
    });

    it('finds the expected user', async () => {
      expect(await usersService.findByEmail(user.email)).toEqual(user);
    });
  });

  describe('#exists', () => {
    let user;
    beforeEach(async () => {
      user = await usersService.save(sampleUsers[0]);
    });

    it('returns true for an existing user', async () => {
      expect(await usersService.exists(user.id)).toBe(true);
    });

    it('returns false for a nonexistent user', async () => {
      expect(await usersService.exists(9999)).toBe(false);
    });
  });

  describe('#save', () => {
    it('creates the expected user', async () => {
      const user = await usersService.save(sampleUsers[0]);
      expect(await usersService.find(user.id)).toEqual(user);
    });

    it('throws an error when invalid data is passed to save', async () => {
      expect.assertions(1);
      const invalidUser = new User();
      await expect(usersService.save(invalidUser)).rejects.toThrow(InvalidEntityException);
    });
  });

  describe('#delete', () => {
    let user;
    beforeEach(async () => {
      user = await usersService.save(sampleUsers[0]);
    });

    it('deletes a user', async () => {
      expect(await usersService.exists(user.id)).toBe(true);
      usersService.delete(user.id);
      expect(await usersService.exists(user.id)).toBe(false);
    });
  });

  describe('#deleteAll', () => {
    let userSavePromises;
    beforeEach(async () => {
      userSavePromises = sampleUsers.map((user) => {
        return usersService.save(user);
      });
      await Promise.all(userSavePromises);
    });

    it('deletes all user', async () => {
      expect((await usersService.findAll()).length).toBeGreaterThan(2); // ensure we're deleting more than one user
      usersService.deleteAll();
      expect((await usersService.findAll())).toHaveLength(0);
    });
  });
});

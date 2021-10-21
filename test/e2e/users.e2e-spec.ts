import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { clearAllTables } from '../helpers/repositoryHelpers';
import { AppModule } from '../../src/app/app.module';
import { User } from '../../src/users/entities/user.entity';
import { UsersService } from '../../src/users/providers/users.service';
import { samplePassword, sampleSalt } from '../helpers/bcryptHelpers';
import {
  createTestAdmin,
  createTestUser, testAdminEmail, testAdminPassword, testUserEmail, testUserPassword,
} from '../helpers/authenticationHelpers';
import { generateSampleUsers, userToPojoWithoutPassword } from '../helpers/userHelpers';

describe('Users', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let testUser: User;
  let sampleUsers;

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
    testUser = await createTestUser(userRepository);
    sampleUsers = generateSampleUsers();
  });

  describe('GET /users', () => {
    beforeEach(async () => {
      const userSavePromises = sampleUsers.map((user) => {
        return usersService.save(user);
      });
      await Promise.all(userSavePromises);
    });

    it('returns the expected status and response body', () => {
      const expectedResponse = [userToPojoWithoutPassword(testUser), ...(sampleUsers.map((u: User) => userToPojoWithoutPassword(u)))];
      expectedResponse.sort((a, b) => a.id - b.id);
      return request(app.getHttpServer())
        .get('/users')
        .auth(testUserEmail, testUserPassword)
        .expect(HttpStatus.OK)
        .expect(expectedResponse);
    });
  });

  describe('GET /users/:id', () => {
    let user: User;
    beforeEach(async () => {
      user = await usersService.save(sampleUsers[0]);
    });

    it('returns the expected user', async () => {
      return request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .auth(testUserEmail, testUserPassword)
        .expect(HttpStatus.OK)
        .expect(userToPojoWithoutPassword(user));
    });
  });

  describe('POST /users', () => {
    beforeEach(() => {
      jest.spyOn(bcrypt, 'genSaltSync').mockImplementation((_rounds) => sampleSalt);
    });

    it('returns the expected data for the created user', async () => {
      const requestTest = request(app.getHttpServer())
        .post('/users')
        .auth(testUserEmail, testUserPassword)
        .send({
          email: 'sample@example.com', password: samplePassword, passwordVerification: samplePassword, isAdmin: true,
        })
        .expect(HttpStatus.CREATED);

      const response = await requestTest;
      const responseBody = userToPojoWithoutPassword(response.body);
      // Need to await requestTest so that we can do a lookup by email for the successfully created user
      expect((userToPojoWithoutPassword(await usersService.findByEmail('sample@example.com')))).toEqual(responseBody);
    });
  });

  describe('PUT /users/:id', () => {
    let user: User;
    const replacementProperties = {
      email: 'newemail@example.com', password: samplePassword, passwordVerification: samplePassword, isAdmin: false,
    };

    beforeEach(async () => {
      user = await usersService.save(sampleUsers[0]);
      jest.spyOn(bcrypt, 'genSaltSync').mockImplementation((_rounds) => sampleSalt);
    });

    it('updates a user and returns the expected result', () => {
      return request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .auth(testUserEmail, testUserPassword)
        .send(replacementProperties)
        .expect(HttpStatus.OK)
        .expect({
          email: 'newemail@example.com', isAdmin: false, id: user.id,
        });
    });
  });

  describe('PATCH /users/:id', () => {
    let user: User;
    const replacementProperties = {
      email: 'ichangedmyemail@example.com',
    };
    beforeEach(async () => {
      user = await usersService.save(sampleUsers[0]);
    });

    it('updates a user and returns the expected result', () => {
      const expectedResponse = { ...user, ...replacementProperties };
      delete expectedResponse.encryptedPassword;
      return request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .auth(testUserEmail, testUserPassword)
        .send(replacementProperties)
        .expect(HttpStatus.OK)
        .expect(expectedResponse);
    });
  });

  describe('DELETE /users/:id', () => {
    let user: User;
    beforeEach(async () => {
      await createTestAdmin(userRepository);
      user = await usersService.save(sampleUsers[0]);
    });

    it('rejects unauthorized requests from non-admins and returns the expected response', async () => {
      const initialNumUsers = (await usersService.findAll()).length;
      expect(initialNumUsers > 0).toBe(true);

      await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .auth(testUserEmail, testUserPassword)
        .expect(HttpStatus.FORBIDDEN);

      expect((await usersService.findAll())).toHaveLength(initialNumUsers);
    });

    it('allows an admin to delete a user and returns the expected response', async () => {
      const initialNumUsers = (await usersService.findAll()).length;
      expect(initialNumUsers > 0).toBe(true);

      await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .auth(testAdminEmail, testAdminPassword)
        .expect(HttpStatus.NO_CONTENT)
        .expect(''); // No response body

      expect((await usersService.findAll())).toHaveLength(initialNumUsers - 1);
    });
  });

  describe('DELETE /users', () => {
    beforeEach(async () => {
      await createTestAdmin(userRepository);
      const userSavePromises = sampleUsers.map((user) => {
        return usersService.save(user);
      });
      await Promise.all(userSavePromises);
    });

    it('rejects unauthorized requests from non-admins and returns the expected response', async () => {
      const initialNumUsers = (await usersService.findAll()).length;
      expect(initialNumUsers > 0).toBe(true);

      await request(app.getHttpServer())
        .delete('/users')
        .auth(testUserEmail, testUserPassword)
        .expect(HttpStatus.FORBIDDEN);

      expect((await usersService.findAll())).toHaveLength(initialNumUsers);
    });

    it('allows an admin to delete all users and returns the expected response', async () => {
      expect((await usersService.findAll()).length > 0).toBe(true);

      await request(app.getHttpServer())
        .delete('/users')
        .auth(testAdminEmail, testAdminPassword)
        .expect(HttpStatus.NO_CONTENT)
        .expect(''); // No response body

      expect((await usersService.findAll())).toHaveLength(0);
    });
  });
});

import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { truncateAndResetAutoIncrement } from '../helpers/repositoryHelpers';
import { AppModule } from '../../src/app/app.module';
import { User } from '../../src/users/entities/user.entity';
import { UsersService } from '../../src/users/providers/users.service';
import { sampleEncryptedPassword, samplePassword, sampleSalt } from '../helpers/bcryptHelpers';

describe('Users', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let userRepository: Repository<User>;

  const sourceUserData = [
    {
      id: 1, email: 'user1@example.com', password: 'greatpassword1', passwordVerification: 'greatpassword1', isAdmin: false,
    },
    {
      id: 2, email: 'user2@example.com', password: 'greatpassword2', passwordVerification: 'greatpassword2', isAdmin: false,
    },
    {
      id: 3, email: 'admin1@example.com', password: 'greatpassword3', passwordVerification: 'greatpassword3', isAdmin: true,
    },
  ];

  const sampleUsers = sourceUserData.map((userData) => {
    const { password, passwordVerification, ...otherUserFields } = userData;
    const user = new User(otherUserFields);
    user.setPassword(password, passwordVerification);

    return user;
  });

  const sampleUserData = sampleUsers.map((user) => {
    return user.toPojo();
  });

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

  beforeEach(() => {
    truncateAndResetAutoIncrement(userRepository, 'user');
  });

  describe('GET /users', () => {
    beforeEach(async () => {
      const userSavePromises = sampleUsers.map((user) => {
        return usersService.save(user);
      });
      await Promise.all(userSavePromises);
    });

    it('returns the expected status and response body', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.OK)
        .expect(sampleUserData);
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
        .expect(HttpStatus.OK)
        .expect(user.toPojo());
    });
  });

  describe('POST /users', () => {
    beforeEach(() => {
      jest.spyOn(bcrypt, 'genSaltSync').mockImplementation((_rounds) => sampleSalt);
    });

    it('returns the expected data for the created user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'sample@example.com', password: samplePassword, passwordVerification: samplePassword, isAdmin: true,
        })
        .expect(HttpStatus.CREATED)
        .expect({
          id: 1, email: 'sample@example.com', encryptedPassword: sampleEncryptedPassword, isAdmin: true,
        });
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
        .send(replacementProperties)
        .expect(HttpStatus.OK)
        .expect({
          email: 'newemail@example.com', encryptedPassword: sampleEncryptedPassword, isAdmin: false, id: user.id,
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
      return request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send(replacementProperties)
        .expect(HttpStatus.OK)
        .expect({ ...user, ...replacementProperties });
    });
  });

  describe('DELETE /users/:id', () => {
    let user: User;
    beforeEach(async () => {
      user = await usersService.save(sampleUsers[0]);
    });

    it('deletes a user and returns the expected response', async () => {
      expect((await usersService.findAll())).toHaveLength(1);

      await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .expect(HttpStatus.NO_CONTENT)
        .expect(''); // No response body

      expect((await usersService.findAll())).toHaveLength(0);
    });
  });

  describe('DELETE /users', () => {
    beforeEach(async () => {
      const userSavePromises = sampleUsers.map((user) => {
        return usersService.save(user);
      });
      await Promise.all(userSavePromises);
    });

    it('deletes a user and returns the expected response', async () => {
      expect((await usersService.findAll())).toHaveLength(sampleUsers.length);

      await request(app.getHttpServer())
        .delete('/users')
        .expect(HttpStatus.NO_CONTENT)
        .expect(''); // No response body

      expect((await usersService.findAll())).toHaveLength(0);
    });
  });
});

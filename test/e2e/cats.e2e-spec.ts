import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CatsService } from '../../src/cats/providers/cats.service';
import { Cat } from '../../src/cats/entities/cat.entity';
import { clearAllTables } from '../helpers/repositoryHelpers';
import { AppModule } from '../../src/app/app.module';
import { createTestUser, testUserEmail, testUserPassword } from '../helpers/authenticationHelpers';
import {
  buildSampleCat, buildSampleCats, sampleCatOptions, catToPojoWithoutUser,
} from '../helpers/catHelpers';
import { UsersService } from '../../src/users/providers/users.service';
import { User } from '../../src/users/entities/user.entity';

describe('Cats', () => {
  let app: INestApplication;
  let catsService: CatsService;
  let catRepository: Repository<Cat>;
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
  });

  describe('GET /cats', () => {
    let cats: Cat[];
    beforeEach(async () => {
      const catSavePromises = buildSampleCats(user).map((cat) => {
        return catsService.create(cat);
      });
      cats = await Promise.all(catSavePromises);
    });

    it('returns the expected status and response body', () => {
      const expectedResponse = cats.map(catToPojoWithoutUser);
      expectedResponse.sort((a, b) => a.id - b.id);
      return request(app.getHttpServer())
        .get('/cats')
        .auth(testUserEmail, testUserPassword)
        .expect(HttpStatus.OK)
        .expect(expectedResponse);
    });
  });

  describe('GET /cats/:id', () => {
    let cat: Cat;
    beforeEach(async () => {
      cat = await catsService.create(buildSampleCat(user));
    });

    it('returns the expected cat', async () => {
      return request(app.getHttpServer())
        .get(`/cats/${cat.id}`)
        .auth(testUserEmail, testUserPassword)
        .expect(HttpStatus.OK)
        .expect(catToPojoWithoutUser(cat));
    });
  });

  describe('GET /cats/random', () => {
    let cat: Cat;

    beforeEach(async () => {
      cat = await catsService.create(buildSampleCat(user));
      jest.spyOn(catsService, 'findRandomId').mockImplementation(() => Promise.resolve(cat.id));
    });

    it('redirects to the expected path', async () => {
      return request(app.getHttpServer())
        .get('/cats/random')
        .auth(testUserEmail, testUserPassword)
        .expect(HttpStatus.FOUND)
        .expect('Location', `/cats/${cat.id}`);
    });
  });

  describe('POST /cats', () => {
    it('returns the expected data for the created cat', () => {
      return request(app.getHttpServer())
        .post('/cats')
        .auth(testUserEmail, testUserPassword)
        .send({
          name: 'Cat-man Dude', breed: 'Half-Man Half-Cat', weight: 170, isFriendly: true,
        })
        .expect(HttpStatus.CREATED)
        .expect({
          id: 1, name: 'Cat-man Dude', breed: 'Half-Man Half-Cat', weight: 170, isFriendly: true,
        });
    });
  });

  describe('PATCH /cats/:id', () => {
    let cat: Cat;
    const replacementProperties = {
      name: 'Cat-man Dude', breed: 'Half-Man Half-Cat',
    };
    beforeEach(async () => {
      cat = await catsService.create(buildSampleCat(user));
    });

    it('updates a cat and returns the expected result', () => {
      return request(app.getHttpServer())
        .patch(`/cats/${cat.id}`)
        .auth(testUserEmail, testUserPassword)
        .send(replacementProperties)
        .expect(HttpStatus.OK)
        .expect({ ...catToPojoWithoutUser(cat), ...replacementProperties });
    });
  });

  describe('DELETE /cats/:id', () => {
    let cat: Cat;
    beforeEach(async () => {
      cat = await catsService.create(buildSampleCat(user));
    });

    it('deletes a cat and returns the expected response', async () => {
      expect((await catsService.findAll())).toHaveLength(1);

      await request(app.getHttpServer())
        .delete(`/cats/${cat.id}`)
        .auth(testUserEmail, testUserPassword)
        .expect(HttpStatus.NO_CONTENT)
        .expect(''); // No response body

      expect((await catsService.findAll())).toHaveLength(0);
    });
  });

  describe('DELETE /cats', () => {
    beforeEach(async () => {
      const catSavePromises = buildSampleCats(user).map((cat) => {
        return catsService.create(cat);
      });
      await Promise.all(catSavePromises);
    });

    it('deletes a cat and returns the expected response', async () => {
      expect((await catsService.findAll())).toHaveLength(sampleCatOptions.length);

      await request(app.getHttpServer())
        .delete('/cats')
        .auth(testUserEmail, testUserPassword)
        .expect(HttpStatus.NO_CONTENT)
        .expect(''); // No response body

      expect((await catsService.findAll())).toHaveLength(0);
    });
  });
});

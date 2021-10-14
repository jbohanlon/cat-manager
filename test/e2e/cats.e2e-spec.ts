import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CatsService } from '../../src/cats/providers/cats.service';
import { Cat } from '../../src/cats/entities/cat.entity';
import { clearAllTables } from '../helpers/repositoryHelpers';
import { AppModule } from '../../src/app/app.module';
import { createTestUser, testUserEmail, testUserPassword } from '../helpers/authenticationHelpers';
import { User } from '../../src/users/entities/user.entity';

describe('Cats', () => {
  let app: INestApplication;
  let catsService: CatsService;
  let catRepository: Repository<Cat>;
  let userRepository: Repository<User>;

  const sampleCatOptions = [
    {
      id: 1, name: 'Dasher', weight: 10, breed: 'Reindeer', isFriendly: true,
    },
    {
      id: 2, name: 'Dancer', weight: 10, breed: 'Reindeer', isFriendly: true,
    },
    {
      id: 3, name: 'Prancer', weight: 10, breed: 'Reindeer', isFriendly: false,
    },
  ];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    catsService = moduleRef.get<CatsService>(CatsService);
    catRepository = moduleRef.get<Repository<Cat>>('CAT_REPOSITORY');
    userRepository = moduleRef.get<Repository<User>>('USER_REPOSITORY');
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearAllTables(catRepository.manager.connection);
    await createTestUser(userRepository);
  });

  describe('GET /cats', () => {
    let cats: Cat[];
    beforeEach(async () => {
      const catSavePromises = sampleCatOptions.map((catOptions) => {
        return catsService.save(new Cat(catOptions));
      });
      cats = await Promise.all(catSavePromises);
    });

    it('returns the expected status and response body', () => {
      const expectedResponse = cats.map((c) => c.toPojo());
      expectedResponse.sort((a: Cat, b: Cat) => a.id - b.id);
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
      cat = await catsService.save(new Cat(sampleCatOptions[0]));
    });

    it('returns the expected cat', async () => {
      return request(app.getHttpServer())
        .get(`/cats/${cat.id}`)
        .auth(testUserEmail, testUserPassword)
        .expect(HttpStatus.OK)
        .expect(cat.toPojo());
    });
  });

  describe('GET /cats/random', () => {
    let cat: Cat;

    beforeEach(async () => {
      cat = await catsService.save(new Cat(sampleCatOptions[0]));
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

  describe('PUT /cats/:id', () => {
    let cat: Cat;
    const replacementProperties = {
      name: 'Cat-man Dude', breed: 'Half-Man Half-Cat', weight: 170, isFriendly: true,
    };
    beforeEach(async () => {
      cat = await catsService.save(new Cat(sampleCatOptions[0]));
    });

    it('updates a cat and returns the expected result', () => {
      return request(app.getHttpServer())
        .put(`/cats/${cat.id}`)
        .auth(testUserEmail, testUserPassword)
        .send(replacementProperties)
        .expect(HttpStatus.OK)
        .expect({ ...replacementProperties, id: cat.id });
    });
  });

  describe('PATCH /cats/:id', () => {
    let cat: Cat;
    const replacementProperties = {
      name: 'Cat-man Dude', breed: 'Half-Man Half-Cat',
    };
    beforeEach(async () => {
      cat = await catsService.save(new Cat(sampleCatOptions[0]));
    });

    it('updates a cat and returns the expected result', () => {
      return request(app.getHttpServer())
        .patch(`/cats/${cat.id}`)
        .auth(testUserEmail, testUserPassword)
        .send(replacementProperties)
        .expect(HttpStatus.OK)
        .expect({ ...cat, ...replacementProperties });
    });
  });

  describe('DELETE /cats/:id', () => {
    let cat: Cat;
    beforeEach(async () => {
      cat = await catsService.save(new Cat(sampleCatOptions[0]));
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
      const catSavePromises = sampleCatOptions.map((catOptions) => {
        return catsService.save(new Cat(catOptions));
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

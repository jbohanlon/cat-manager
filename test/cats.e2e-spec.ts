import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CatsModule } from '../src/cats/cats.module';
import { CatsService } from '../src/cats/providers/cats.service';
import { Cat } from '../src/cats/entities/cat.entity';
import { truncateAndResetAutoIncrement } from './helpers/repositoryHelpers';

describe('Cats', () => {
  let app: INestApplication;
  let catsService: CatsService;
  let catRepository: Repository<Cat>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CatsModule],
    }).compile();

    catsService = moduleRef.get<CatsService>(CatsService);
    catRepository = moduleRef.get<Repository<Cat>>('CAT_REPOSITORY');
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    truncateAndResetAutoIncrement(catRepository, 'cat');
  });

  describe('GET /cats', () => {
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

    beforeEach(async () => {
      const catSavePromises = sampleCatOptions.map((catOptions) => {
        return catsService.save(new Cat(catOptions));
      });
      await Promise.all(catSavePromises);
    });

    it('returns the expected status and response body', async () => {
      return request(app.getHttpServer())
        .get('/cats')
        .expect(HttpStatus.OK)
        .expect(sampleCatOptions);
    });
  });

  describe('POST /cats', () => {
    it('returns the expected data for the created cat', async () => {
      return request(app.getHttpServer())
        .post('/cats')
        .send({
          name: 'Cat-man Dude', breed: 'Half-Man Half-Cat', weight: 170, isFriendly: true,
        })
        .expect(HttpStatus.CREATED)
        .expect({
          id: 1, name: 'Cat-man Dude', breed: 'Half-Man Half-Cat', weight: 170, isFriendly: true,
        });
    });
  });
});

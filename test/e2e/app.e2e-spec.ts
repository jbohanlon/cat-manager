import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../../src/app/app.module';
import { createTestUser, testUserEmail, testUserPassword } from '../helpers/authenticationHelpers';
import { clearAllTables } from '../helpers/repositoryHelpers';
import { User } from '../../src/users/entities/user.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    userRepository = moduleRef.get<Repository<User>>('USER_REPOSITORY');
  });

  beforeEach(async () => {
    await clearAllTables(userRepository.manager.connection);
    await createTestUser(userRepository);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .auth(testUserEmail, testUserPassword)
      .expect(200)
      .expect('Hello World!');
  });
});

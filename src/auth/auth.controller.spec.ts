import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database/database.module';
import { User } from '../users/users.entity';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;

  const user = new User();
  user.id = 1;
  user.login = 'admin@user.com';
  user.password = 'qwe123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, AuthModule],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    app = module.createNestApplication();
    app.enableShutdownHooks();
    await app.init();
  });

  it(`/POST auth/login`, () => {
    const access_token = authService.sign(user.id);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(User, 'comparePassword').mockResolvedValue(true);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: user.login, password: user.password })
      .set('Accept', 'application/json')
      .expect(201)
      .expect({ access_token });
  });

  it(`/GET profile`, () => {
    const access_token = authService.sign(user.id);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);

    return request(app.getHttpServer())
      .get('/profile')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect({ user: user.toPlain() });
  });

  afterEach(async () => {
    await app.close();
  });
});

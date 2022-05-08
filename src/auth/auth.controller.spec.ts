import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { User } from './users.entity';
import { AuthModule } from './auth.module';
import { DatabaseModule } from '../database/database.module';

describe('AuthController', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const user = new User();
  user.id = 1;
  user.login = 'admin@user.com';
  user.password = 'qwe123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, DatabaseModule],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);

    app = module.createNestApplication();
    await app.init();
  });

  it(`/POST auth/login`, () => {
    const payload = { ...user.toPlain(), sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(User, 'comparePassword').mockResolvedValue(true);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: user.login, password: user.password })
      .set('Accept', 'application/json')
      .expect(201)
      .expect({
        access_token,
      });
  });

  afterAll(async () => {
    await app.close();
  });
});

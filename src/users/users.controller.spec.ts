import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/users.entity';

describe('UsersController', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);

    app = module.createNestApplication();
    app.enableShutdownHooks();
    await app.init();
  });

  it(`/GET /users by SuperAdmin`, () => {
    const user = new User();
    user.id = 1;
    user.login = 'admin@user.com';
    user.password = 'qwe123';
    user.isSuperAdmin = true;

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(usersService, 'findAll').mockResolvedValue([user]);

    return request(app.getHttpServer())
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect([user.toPlain()]);
  });

  it(`/GET /users by any user`, () => {
    const user = new User();
    user.id = 2;
    user.login = 'user@user.com';
    user.password = 'qwe123';

    const payload = { sub: user.id };
    const access_token = jwtService.sign(payload);

    jest.spyOn(User, 'findOneBy').mockResolvedValue(user);
    jest.spyOn(usersService, 'findAll').mockResolvedValue([user]);

    return request(app.getHttpServer())
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(403);
  });

  afterAll(async () => {
    await app.close();
  });
});

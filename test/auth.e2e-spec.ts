import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from './../src/app.module';

describe('Auth Protected Routes (e2e)', () => {
  let app: INestApplication;
  const jwtSecret = 'test-secret-key';
  const validUserId = 1;

  const createValidToken = (userId: number = validUserId): string => {
    return jwt.sign(
      { userId, username: 'testuser' },
      jwtSecret,
    );
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('JWT_SECRET')
      .useValue(jwtSecret)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /cvs - Create CV (Protected)', () => {
    it('should create CV with valid token', async () => {
      const validToken = createValidToken();
      const createCvDto = {
        name: 'Doe',
        firstname: 'John',
        age: 30,
        cin: 'AB123456',
        job: 'Software Engineer',
      };

      const response = await request(app.getHttpServer())
        .post('/cvs')
        .set('Authorization', `Bearer ${validToken}`)
        .send(createCvDto);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toBeDefined();
    });

    it('should return 401 when token is missing', async () => {
      const createCvDto = {
        name: 'Doe',
        firstname: 'John',
        age: 30,
        cin: 'AB123456',
        job: 'Software Engineer',
      };

      const response = await request(app.getHttpServer())
        .post('/cvs')
        .send(createCvDto);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 when authorization header format is invalid', async () => {
      const createCvDto = {
        name: 'Doe',
        firstname: 'John',
        age: 30,
        cin: 'AB123456',
        job: 'Software Engineer',
      };

      const response = await request(app.getHttpServer())
        .post('/cvs')
        .set('Authorization', 'InvalidFormat')
        .send(createCvDto);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 when token is invalid', async () => {
      const createCvDto = {
        name: 'Doe',
        firstname: 'John',
        age: 30,
        cin: 'AB123456',
        job: 'Software Engineer',
      };

      const response = await request(app.getHttpServer())
        .post('/cvs')
        .set('Authorization', 'Bearer invalid.token.here')
        .send(createCvDto);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /cvs/:id - Update CV (Protected)', () => {
    it('should return 401 when token is missing', async () => {
      const updateCvDto = {
        job: 'Senior Software Engineer',
      };

      const response = await request(app.getHttpServer())
        .patch('/cvs/1')
        .send(updateCvDto);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 when authorization header format is invalid', async () => {
      const updateCvDto = {
        job: 'Senior Software Engineer',
      };

      const response = await request(app.getHttpServer())
        .patch('/cvs/1')
        .set('Authorization', 'InvalidFormat')
        .send(updateCvDto);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /cvs/:id - Delete CV (Protected)', () => {
    it('should return 401 when token is missing', async () => {
      const response = await request(app.getHttpServer()).delete('/cvs/1');

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 when authorization header format is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/cvs/1')
        .set('Authorization', 'Bearer');

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /cvs - List CVs (Unprotected)', () => {
    it('should return CVs without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/cvs');

      expect(response.status).toBe(HttpStatus.OK);
    });
  });

  describe('GET /cvs/:id - Get CV (Unprotected)', () => {
    it('should return CV without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/cvs/1');

      expect([HttpStatus.OK, HttpStatus.NOT_FOUND]).toContain(response.status);
    });
  });
});

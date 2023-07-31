import request from 'supertest';
import app from '../../../../src/app';
import config from '../../../../src/config';
import mongoose from 'mongoose';
import Restaurant from '../../../../src/models/Restaurant';

describe('auth', () => { 
  beforeAll(async () => {
    await mongoose.connect(config.urlDb);
  });

  afterAll(async () => {
    await Restaurant.deleteMany({});
    await mongoose.connection.close();
  });
  // auth
  // signup form
  // should give response data with userId
  it('should give response data with userId', async () => {
    const payload = {
      username: 'hellousername',
      name: 'user',
      email: 'hellousername@gmail.com',
      password: 'hellousername123',
    };
    const response = await request(app)
      .post('/api/v1/resto/auth/signup')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('userId');
  });
  // signin
  // should give response data with userId and get cookie
  it('should give response data with userId and get cookie', async () => {
    const payload = {
      username: 'hellousername',
      name: 'user',
      email: 'hellousername@gmail.com',
      password: 'hellousername123',
    };
    await request(app)
      .post('/api/v1/resto/auth/signup')
      .send(payload);

    const response = await request(app)
      .post('/api/v1/resto/auth/signin')
      .send({
        email: payload.username,
        password: payload.password,
      });
    
    const cookieName = config.restoAccessTokenCookieName;
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('userId');
    expect(response.header['set-cookie']).toBeDefined();
    expect(response.header['set-cookie'][0]).toContain(cookieName);
  }, 10000);
})
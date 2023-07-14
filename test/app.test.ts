import request from 'supertest';
import app from '../src/app';

describe('App.ts test', () => {
  test('Test first request root', async () => {
    const res = await request(app).get('/');
    expect(res.body).toEqual({ message: 'Hello World!' });
  });
});
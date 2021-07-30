const request = require('supertest');
const app = require('../app');
const createUserFactory = require('./factories/createUserFactory');

describe('User', () => {
  it('should create user', async () => {
    const user = createUserFactory();

    const response = await request(app).post('/register').send(user);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should not create user with same email', async () => {
    const user = createUserFactory();

    await request(app).post('/register').send(user);

    const response = await request(app).post('/register').send(user);

    expect(response.status).toBe(400);
  });
});

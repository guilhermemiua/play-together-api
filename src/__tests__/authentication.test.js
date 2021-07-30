const request = require('supertest');
const faker = require('faker');
const app = require('../app');
const { hashPassword } = require('../controllers/UserController');
const { User } = require('../models');
const createUserFactory = require('./factories/createUserFactory');

describe('Authentication', () => {
  it('should authenticate with valid credentials', async () => {
    const user = createUserFactory();

    // Hashing pass because it will insert directly into database
    const passwordHashed = await hashPassword(user.password);

    await User.query().insert({
      ...user,
      password: passwordHashed,
    });

    const response = await request(app).post('/authenticate').send({
      email: user.email,
      password: user.password,
    });

    expect(response.status).toBe(200);
  });

  it('should not authenticate with invalid credentials', async () => {
    const response = await request(app).post('/authenticate').send({
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    expect(response.status).toBe(404);
  });

  it('should return jwt token when authenticated', async () => {
    const user = createUserFactory();

    // Hashing pass because it will insert directly into database
    const passwordHashed = await hashPassword(user.password);

    await User.query().insert({
      ...user,
      password: passwordHashed,
    });

    await User.query().insert(user);

    const response = await request(app).post('/authenticate').send({
      email: user.email,
      password: user.password,
    });

    expect(response.body).toHaveProperty('token');
  });

  it('should be able to access private routes when authenticated', async () => {
    const user = createUserFactory();

    // Hashing pass because it will insert directly into database
    const passwordHashed = await hashPassword(user.password);

    await User.query().insert({
      ...user,
      password: passwordHashed,
    });

    const {
      body: { token },
    } = await request(app).post('/authenticate').send({
      email: user.email,
      password: user.password,
    });

    const response = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it('should not be able to access private routes without jwt token', async () => {
    const response = await request(app).get('/me');

    expect(response.status).toBe(401);
  });

  it('should not be able to access private routes with invalid jwt token', async () => {
    const response = await request(app)
      .get('/me')
      .set('Authorization', 'Bearer 123123');

    expect(response.status).toBe(401);
  });
});

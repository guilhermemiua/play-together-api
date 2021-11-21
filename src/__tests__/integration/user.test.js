const request = require('supertest');
const app = require('../../app');
const { hashPassword } = require('../../controllers/UserController');
const { User } = require('../../models');
const createUserFactory = require('../factories/createUserFactory');

describe('User', () => {
  let token;

  beforeAll(async () => {
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

    token = response.body.token;
  });

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

  it('should not create user with invalid parameters', async () => {
    const user = {};

    await request(app).post('/register').send(user);

    const response = await request(app).post('/register').send(user);

    expect(response.status).toBe(500);
  });
  it('should update profile', async () => {
    const response = await request(app)
      .put('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        first_name: 'Guilherme',
      });

    expect(response.status).toBe(200);
  });

  it('should list users', async () => {
    const response = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

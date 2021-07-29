const request = require('supertest');
const app = require('../app');
const { hashPassword } = require('../controllers/UserController');
const { User } = require('../models');

describe('Authentication', () => {
  it('should authenticate with valid credentials', async () => {
    const password = '123456';
    const passwordHashed = await hashPassword(password);

    const user = {
      first_name: 'Guilherme',
      last_name: 'Eiti',
      email: 'guilhermeeiti@gmail.com',
      password: passwordHashed,
      age: 21,
      gender: 'male',
      is_email_verified: true,
    };

    await User.query().insert(user);

    const response = await request(app).post('/authenticate').send({
      email: user.email,
      password,
    });

    expect(response.status).toBe(200);
  });

  it('should not authenticate with invalid credentials', async () => {
    const response = await request(app).post('/authenticate').send({
      email: 'not_existing_user@gmail.com',
      password: '123456',
    });

    expect(response.status).toBe(404);
  });

  it('should return jwt token when authenticated', async () => {
    const password = '123456';
    const passwordHashed = await hashPassword(password);

    const user = {
      first_name: 'Guilherme',
      last_name: 'Miua',
      email: 'guilhermemiua@gmail.com',
      password: passwordHashed,
      age: 21,
      gender: 'male',
      is_email_verified: true,
    };

    await User.query().insert(user);

    const response = await request(app).post('/authenticate').send({
      email: user.email,
      password,
    });

    expect(response.body).toHaveProperty('token');
  });

  it('should be able to access private routes when authenticated', async () => {
    const password = '123456';
    const passwordHashed = await hashPassword(password);

    const user = {
      first_name: 'Guilherme',
      last_name: 'Akita',
      email: 'guilherme@gmail.com',
      password: passwordHashed,
      age: 21,
      gender: 'male',
      is_email_verified: true,
    };

    await User.query().insert(user);

    const {
      body: { token },
    } = await request(app).post('/authenticate').send({
      email: user.email,
      password,
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

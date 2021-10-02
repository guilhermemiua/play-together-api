const request = require('supertest');
const app = require('../../app');
const { hashPassword } = require('../../controllers/UserController');
const { User } = require('../../models');
const createEventFactory = require('../factories/createEventFactory');
const createUserFactory = require('../factories/createUserFactory');

describe('Event', () => {
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

  it('should create event', async () => {
    const event = createEventFactory();

    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${token}`)
      .send(event);

    // expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should not create event with invalid parameters', async () => {
    const event = {};

    await request(app).post('/event').send(event);

    const response = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${token}`)
      .send(event);

    expect(response.status).toBe(400);
  });
});

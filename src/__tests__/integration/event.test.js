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

  it('should delete event', async () => {
    const event = createEventFactory();

    const createEvent = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${token}`)
      .send(event);

    const response = await request(app)
      .delete(`/event/${createEvent.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(event);

    expect(response.status).toBe(200);
  });

  it('should update event', async () => {
    const event = createEventFactory();

    const createEvent = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${token}`)
      .send(event);

    const updateEvent = createEventFactory();

    const response = await request(app)
      .put(`/event/${createEvent.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateEvent);

    expect(response.status).toBe(200);
  });

  it('should show event', async () => {
    const event = createEventFactory();

    const createEvent = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${token}`)
      .send(event);

    const response = await request(app)
      .get(`/event/${createEvent.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(event);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should list events', async () => {
    const response = await request(app)
      .get('/event')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

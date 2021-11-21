const request = require('supertest');
const app = require('../../app');
const { hashPassword } = require('../../controllers/UserController');
const { User } = require('../../models');
const createGroupFactory = require('../factories/createGroupFactory');
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

  it('should create group', async () => {
    const group = createGroupFactory();

    const response = await request(app)
      .post('/group')
      .set('Authorization', `Bearer ${token}`)
      .send(group);

    expect(response.body).toHaveProperty('id');
  });

  it('should not create group with invalid parameters', async () => {
    const group = {};

    await request(app).post('/group').send(group);

    const response = await request(app)
      .post('/group')
      .set('Authorization', `Bearer ${token}`)
      .send(group);

    expect(response.status).toBe(400);
  });

  it('should delete group', async () => {
    const group = createGroupFactory();

    const createEvent = await request(app)
      .post('/group')
      .set('Authorization', `Bearer ${token}`)
      .send(group);

    const response = await request(app)
      .delete(`/group/${createEvent.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(group);

    expect(response.status).toBe(200);
  });

  it('should update group', async () => {
    const group = createGroupFactory();

    const createEvent = await request(app)
      .post('/group')
      .set('Authorization', `Bearer ${token}`)
      .send(group);

    const updateEvent = createGroupFactory();

    const response = await request(app)
      .put(`/group/${createEvent.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateEvent);

    expect(response.status).toBe(200);
  });

  it('should show group', async () => {
    const group = createGroupFactory();

    const createEvent = await request(app)
      .post('/group')
      .set('Authorization', `Bearer ${token}`)
      .send(group);

    const response = await request(app)
      .get(`/group/${createEvent.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(group);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should list groups', async () => {
    const response = await request(app)
      .get('/group')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

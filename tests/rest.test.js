const request = require('supertest');
const { createApp } = require('../src/app');
const store = require('../src/data/store');

let app;

beforeAll(async () => {
  app = await createApp();
});

beforeEach(() => {
  store.resetStore();
});

describe('GET /users', () => {
  it('returns all users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ id: '1', name: 'Alice Smith', email: 'alice@example.com' });
  });
});

describe('GET /users/:id', () => {
  it('returns a user by id', async () => {
    const res = await request(app).get('/users/1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: '1', name: 'Alice Smith' });
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/users/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /users', () => {
  it('creates a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Charlie', email: 'charlie@example.com' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Charlie', email: 'charlie@example.com' });
    expect(res.body).toHaveProperty('id');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/users').send({ email: 'x@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request(app).post('/users').send({ name: 'X', email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 409 when email is already in use', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Duplicate', email: 'alice@example.com' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already in use/i);
  });
});

describe('PUT /users/:id', () => {
  it('updates an existing user', async () => {
    const res = await request(app)
      .put('/users/1')
      .send({ name: 'Alice Updated', email: 'alice.updated@example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: '1', name: 'Alice Updated' });
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .put('/users/999')
      .send({ name: 'X', email: 'x@example.com' });
    expect(res.status).toBe(404);
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request(app)
      .put('/users/1')
      .send({ name: 'Alice', email: 'bad-email' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when new email belongs to another user', async () => {
    const res = await request(app)
      .put('/users/1')
      .send({ name: 'Alice', email: 'bob@example.com' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /users/:id', () => {
  it('deletes an existing user', async () => {
    const res = await request(app).delete('/users/1');
    expect(res.status).toBe(204);
    const check = await request(app).get('/users/1');
    expect(check.status).toBe(404);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/users/999');
    expect(res.status).toBe(404);
  });
});

describe('Unknown routes', () => {
  it('returns 404 for routes that do not exist', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});

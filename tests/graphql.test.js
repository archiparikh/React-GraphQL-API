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

/** Helper to send a GraphQL request */
function gql(query, variables = {}) {
  return request(app).post('/graphql').send({ query, variables });
}

describe('GraphQL Query: users', () => {
  it('returns all users', async () => {
    const res = await gql('{ users { id name email } }');
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.users).toHaveLength(2);
    expect(res.body.data.users[0]).toMatchObject({ name: 'Alice Smith' });
  });
});

describe('GraphQL Query: user(id)', () => {
  it('returns a user by id', async () => {
    const res = await gql('query($id: ID!) { user(id: $id) { id name } }', { id: '1' });
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.user).toMatchObject({ id: '1', name: 'Alice Smith' });
  });

  it('returns NOT_FOUND error for unknown id', async () => {
    const res = await gql('query($id: ID!) { user(id: $id) { id } }', { id: '999' });
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].code).toBe('NOT_FOUND');
  });
});

describe('GraphQL Mutation: createUser', () => {
  it('creates a new user', async () => {
    const res = await gql(
      'mutation($name: String!, $email: String!) { createUser(name: $name, email: $email) { id name email } }',
      { name: 'Charlie', email: 'charlie@example.com' }
    );
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.createUser).toMatchObject({ name: 'Charlie', email: 'charlie@example.com' });
  });

  it('returns BAD_USER_INPUT when name is empty', async () => {
    const res = await gql(
      'mutation { createUser(name: "", email: "x@example.com") { id } }'
    );
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].code).toBe('BAD_USER_INPUT');
  });

  it('returns BAD_USER_INPUT when email is invalid', async () => {
    const res = await gql(
      'mutation { createUser(name: "X", email: "not-an-email") { id } }'
    );
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].code).toBe('BAD_USER_INPUT');
  });

  it('returns CONFLICT when email is already in use', async () => {
    const res = await gql(
      'mutation { createUser(name: "Dup", email: "alice@example.com") { id } }'
    );
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].code).toBe('CONFLICT');
  });
});

describe('GraphQL Mutation: updateUser', () => {
  it('updates an existing user', async () => {
    const res = await gql(
      'mutation($id: ID!, $name: String) { updateUser(id: $id, name: $name) { id name } }',
      { id: '1', name: 'Alice Updated' }
    );
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.updateUser).toMatchObject({ id: '1', name: 'Alice Updated' });
  });

  it('returns NOT_FOUND for unknown id', async () => {
    const res = await gql(
      'mutation { updateUser(id: "999", name: "X") { id } }'
    );
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].code).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when email belongs to another user', async () => {
    const res = await gql(
      'mutation { updateUser(id: "1", email: "bob@example.com") { id } }'
    );
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].code).toBe('CONFLICT');
  });
});

describe('GraphQL Mutation: deleteUser', () => {
  it('deletes an existing user', async () => {
    const res = await gql('mutation { deleteUser(id: "1") }');
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.deleteUser).toBe(true);
  });

  it('returns NOT_FOUND for unknown id', async () => {
    const res = await gql('mutation { deleteUser(id: "999") }');
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].code).toBe('NOT_FOUND');
  });
});

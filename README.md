# React-GraphQL-API

Backend‑First Project — REST/GraphQL API showing error handling & tests

A Node.js backend that exposes the same **Users** resource over both a **REST API** (Express) and a **GraphQL API** (Apollo Server). The project demonstrates structured error handling and is fully covered by an automated test suite (Jest + Supertest).

---

## Project structure

```
src/
  data/store.js          # In-memory data store (simulates a database)
  errors.js              # Custom error classes (NotFoundError, ValidationError, ConflictError)
  routes/users.js        # Express REST router
  graphql/
    schema.js            # GraphQL type definitions
    resolvers.js         # GraphQL resolvers with error handling
  app.js                 # Express + Apollo setup, global error handler
  index.js               # Server entry point
tests/
  rest.test.js           # REST API integration tests
  graphql.test.js        # GraphQL API integration tests
.github/workflows/ci.yml # GitHub Actions CI
```

---

## Getting started

```bash
npm install
npm start         # http://localhost:4000
```

### REST endpoints

| Method | Path          | Description        |
|--------|---------------|--------------------|
| GET    | /users        | List all users     |
| GET    | /users/:id    | Get user by id     |
| POST   | /users        | Create a user      |
| PUT    | /users/:id    | Replace a user     |
| DELETE | /users/:id    | Delete a user      |

### GraphQL endpoint

`POST /graphql` — use the Apollo Sandbox at <http://localhost:4000/graphql>.

**Example queries:**

```graphql
# List all users
{ users { id name email } }

# Get one user
query { user(id: "1") { id name email } }

# Create a user
mutation { createUser(name: "Eve", email: "eve@example.com") { id name } }

# Update a user
mutation { updateUser(id: "1", name: "Alice O.") { id name } }

# Delete a user
mutation { deleteUser(id: "2") }
```

---

## Error handling

### REST API

Errors are returned as JSON with a matching HTTP status code:

```json
{ "error": "User 99 not found" }
```

| Error class      | HTTP status |
|------------------|-------------|
| NotFoundError    | 404         |
| ValidationError  | 400         |
| ConflictError    | 409         |

### GraphQL API

Errors include a `code` extension for programmatic handling:

```json
{
  "errors": [{
    "message": "User 99 not found",
    "code": "NOT_FOUND"
  }]
}
```

| Scenario                | Code              |
|-------------------------|-------------------|
| Resource not found      | NOT_FOUND         |
| Invalid input           | BAD_USER_INPUT    |
| Email already in use    | CONFLICT          |

---

## Running tests

```bash
npm test
```

26 tests across two suites (REST + GraphQL) covering happy paths and all error conditions.

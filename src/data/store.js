/**
 * In-memory data store for users.
 * Simulates a database for demonstration purposes.
 */

let users = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com' },
  { id: '2', name: 'Bob Jones', email: 'bob@example.com' },
];

let nextId = 3;

function getAllUsers() {
  return [...users];
}

function getUserById(id) {
  return users.find((u) => u.id === id) || null;
}

function getUserByEmail(email) {
  return users.find((u) => u.email === email) || null;
}

function createUser(name, email) {
  const user = { id: String(nextId++), name, email };
  users.push(user);
  return user;
}

function updateUser(id, fields) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...fields };
  return users[index];
}

function deleteUser(id) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

/** Reset the store to its initial state (used in tests). */
function resetStore() {
  users = [
    { id: '1', name: 'Alice Smith', email: 'alice@example.com' },
    { id: '2', name: 'Bob Jones', email: 'bob@example.com' },
  ];
  nextId = 3;
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  resetStore,
};

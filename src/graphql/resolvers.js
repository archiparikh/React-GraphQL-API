const { UserInputError, ApolloError } = require('apollo-server-express');
const store = require('../data/store');
const { isValidEmail } = require('../validators');

const resolvers = {
  Query: {
    users: () => store.getAllUsers(),

    user: (_, { id }) => {
      const user = store.getUserById(id);
      if (!user) {
        throw new ApolloError(`User ${id} not found`, 'NOT_FOUND');
      }
      return user;
    },
  },

  Mutation: {
    createUser: (_, { name, email }) => {
      if (!name || name.trim() === '') {
        throw new UserInputError('Field "name" is required');
      }
      if (!email || !isValidEmail(email)) {
        throw new UserInputError('Field "email" must be a valid email address');
      }
      if (store.getUserByEmail(email)) {
        throw new ApolloError(`Email "${email}" is already in use`, 'CONFLICT');
      }
      return store.createUser(name.trim(), email.trim());
    },

    updateUser: (_, { id, name, email }) => {
      const existing = store.getUserById(id);
      if (!existing) {
        throw new ApolloError(`User ${id} not found`, 'NOT_FOUND');
      }
      if (email !== undefined && !isValidEmail(email)) {
        throw new UserInputError('Field "email" must be a valid email address');
      }
      const emailOwner = email ? store.getUserByEmail(email) : null;
      if (emailOwner && emailOwner.id !== id) {
        throw new ApolloError(`Email "${email}" is already in use`, 'CONFLICT');
      }
      return store.updateUser(id, {
        ...(name !== undefined && { name: name.trim() }),
        ...(email !== undefined && { email: email.trim() }),
      });
    },

    deleteUser: (_, { id }) => {
      const deleted = store.deleteUser(id);
      if (!deleted) {
        throw new ApolloError(`User ${id} not found`, 'NOT_FOUND');
      }
      return true;
    },
  },
};

module.exports = { resolvers };

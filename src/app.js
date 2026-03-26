const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');
const { AppError } = require('./errors');
const usersRouter = require('./routes/users');

async function createApp() {
  const app = express();
  app.use(express.json());

  // REST routes
  app.use('/users', usersRouter);

  // Apollo / GraphQL
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (err) => ({
      message: err.message,
      code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
    }),
  });
  await apollo.start();
  apollo.applyMiddleware({ app, path: '/graphql' });

  // 404 handler for unknown REST routes
  app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };

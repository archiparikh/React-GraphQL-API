const { createApp } = require('./app');

const PORT = process.env.PORT || 4000;

createApp().then((app) => {
  app.listen(PORT, () => {
    console.log(`REST API:     http://localhost:${PORT}/users`);
    console.log(`GraphQL API:  http://localhost:${PORT}/graphql`);
  });
});

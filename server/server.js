//  Import required modules and packages
const express = require('express');
const path = require('path');
const { authMiddleware } = require('./utils/auth');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

// Import GraphQL type definitions and resolvers
const { typeDefs, resolvers } = require('./schemas');
// Import and establish connection to MongoDB using mongoose
const db = require('./config/connection');

// Create an Express application and configure it with the Apollo Server
const app = express();
const PORT = process.env.PORT || 3001;
// Create an Apollo Server instance with the defined type definitions and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Configure Express to use middleware for parsing URL - encoded and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets in production (React build folder)
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the 'client/build' directory
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Route for handling root URL in production and serving the React build
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build'));
  });
}

// Function to start the Apollo Server and handle GraphQL requests
const startApolloServer = async (typeDefs, resolvers) => {
  // Start the Apollo Server and listen for requests
  await server.start();

  // Set up middleware for handling GraphQL requests at the '/graphql' endpoint
  app.use('/graphql', expressMiddleware(server, {
    // Use the authentication middleware to populate the user on each request
    context: authMiddleware,
  }));

  // Once MongoDB connection is open, start the Express server
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

// Start the Apollo Server with the provided type definitions and resolvers
startApolloServer(typeDefs, resolvers);
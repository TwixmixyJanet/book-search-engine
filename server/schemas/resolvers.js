// Import necessary modules and models
const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

// Define GraphQL resolvers
const resolvers = {
  // Query resolvers for retrieving data
  Query: {
    // Resolver for fetching the authenticated user's data (via user profile)
    me: async (parent, args, context) => {
      // Check if user is authenticated (logged in via JWT)
      if (context.user) {
        // Fetch user data excluding sensitive information
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );

        return userData;
      }

      // Throw an error if the user is not authenticated
      throw new AuthenticationError("Not logged in");
    },
  },

  // Mutation resolvers for performing CRUD operations
  Mutation: {
    // Resolver for creating a new user
    addUser: async (parent, args) => {
      // Create a new user with the provided arguments
      const user = await User.create(args);
      // Generate a token for the new user using JWT
      const token = signToken(user);

      // Return the token and user information
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      console.log("Login attempt with email:", email);
      // Find the user with the provided email
      const user = await User.findOne({ email });

      // If the user is not found, throw an authentication error
      if (!user) {
        console.log("User not found");
        throw new AuthenticationError("Incorrect credentials");
      }

      // Check if the provided password matches the user's password
      const correctPw = await user.isCorrectPassword(password);

      // If the password is incorrect, throw an authentication error
      if (!correctPw) {
        console.log("Incorrect password");
        throw new AuthenticationError("Incorrect credentials");
      }

      // If login is successful, generate a token for the user
      const token = signToken(user);
      console.log("Login successful. Token:", token);
      // Return the token and user information
      return { token, user };
    },
    // Resolver for saving a book to the user's profile
    saveBook: async (parent, { bookData }, context) => {
      // Check if user is authenticated (logged in via JWT)
      if (context.user) {
        // Add the provided bookData to the user's savedBooks array
        const updatedBooks = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true }
        ).populate("savedBooks");

        // Return the updated user data with populated savedBooks array
        return updatedBooks;
      }

      // Throw an error if the user is not authenticated
      throw new AuthenticationError("You need to be logged in!");
    },
    // Resolver for removing a book from the user's account
    removeBook: async (parent, { bookId }, context) => {
      // Check if user is authenticated
      if (context.user) {
        // Remove the book with the specified bookId from the user's savedBooks array
        const updatedBooks = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        // Return the updated user data
        return updatedBooks;
      }

      // Throw an error if the user is not authenticated
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

// Export the resolvers for use in Apollo Server
module.exports = resolvers;

# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `data-source.ts` file
3. Run `npm start` command

# API Documentation

## Overview

This API allows users to manage posts, including creating, retrieving, and deleting posts. It also includes user authentication and registration functionalities. The API is built using GraphQL and uses TypeScript with TypeGraphQL.

## Base URL

```
http://localhost:4000/graphql
```

## Authentication

### JWT Authentication

The API uses JWT (JSON Web Tokens) for authentication. Upon successful login, the server responds with an access token and a refresh token.

### Accessing Protected Routes

To access protected routes (e.g., creating or deleting a post), you must include the access token in the headers:

```
Authorization: Bearer <access_token>
```

## Endpoints

### User Resolvers

#### 1. Register a New User

- **Mutation**: `register`
- **Description**: Creates a new user account.
- **Arguments**:
  - `name`: `String` - The name of the user.
  - `email`: `String` - The email of the user.
  - `password`: `String` - The password of the user.
- **Returns**: `String` - A message indicating successful registration.
- **Errors**:
  - `EMAIL_EXISTS`: User with that email already exists.
  - `REGISTRATION_FAILED`: Registration failed due to an error.

```graphql
mutation {
  register(name: "test", email: "test@test.com", password: "password123")
}
```

#### 2. Login User

- **Mutation**: `login`
- **Description**: Authenticates a user and returns access and refresh tokens.
- **Arguments**:
  - `email`: `String` - The user's email.
  - `password`: `String` - The user's password.
- **Returns**: `LoginResponse` - Contains access token, refresh token, and user details.
- **Errors**:
  - `USER_NOT_FOUND`: User not found.
  - `INVALID_PASSWORD`: Invalid password.
  - `LOGIN_FAILED`: Login failed due to an error.

```graphql
mutation {
  login(email: "test@test.com", password: "password123") {
    accessToken
    refreshToken
    user {
      id
      name
      email
    }
  }
}
```

#### 3. Refresh Access Token

- **Mutation**: `refreshToken`
- **Description**: Generates a new access token using a refresh token.
- **Arguments**:
  - `refreshToken`: `String` - The refresh token.
- **Returns**: `String` - A new access token.
- **Errors**:
  - `INVALID_REFRESH_TOKEN`: Invalid refresh token.
  - `TOKEN_REFRESH_FAILED`: Token refresh failed due to an error.

```graphql
mutation {
  refreshToken(refreshToken: "<your_refresh_token>")
}
```

### Post Resolvers

#### 4. Create a New Post

- **Mutation**: `createPost`
- **Description**: Creates a new post.
- **Arguments**:
  - `title`: `String` - The title of the post.
  - `content`: `String` - The content of the post.
  - `userId`: `Number` - The ID of the user creating the post (passed from authentication).
- **Returns**: `Post` - The newly created post.
- **Errors**:
  - `NOT_AUTHENTICATED`: User ID not found in payload.
  - `AUTHOR_NOT_FOUND`: Author not found in the database.
  - `POST_CREATION_FAILED`: An error occurred while creating the post.

```graphql
mutation {
  createPost(
    title: "My First Post"
    content: "This is the content of my first post"
  ) {
    id
    title
    content
    author {
      id
      name
    }
  }
}
```

#### 5. Get All Posts

- **Query**: `getAllPosts`
- **Description**: Retrieves all posts from the database.
- **Returns**: `[Post]` - An array of posts.

```graphql
query {
  getAllPosts {
    id
    title
    content
    author {
      id
      name
    }
  }
}
```

#### 6. Get Post by ID

- **Query**: `getPostById`
- **Description**: Retrieves a specific post by its ID.
- **Arguments**:
  - `id`: `Number` - The ID of the post.
- **Returns**: `Post` - The requested post, or `null` if not found.

```graphql
query {
  getPostById(id: 1) {
    id
    title
    content
    author {
      id
      name
    }
  }
}
```

#### 7. Get Posts by User ID

- **Query**: `getUserPosts`
- **Description**: Retrieves all posts authored by a specific user.
- **Arguments**:
  - `userId`: `Number` - The ID of the user whose posts are being retrieved.
- **Returns**: `[Post]` - An array of posts by the specified user.

```graphql
query {
  getUserPosts(userId: 1) {
    id
    title
    content
    author {
      id
      name
    }
  }
}
```

#### 8. Delete a Post

- **Mutation**: `deletePost`
- **Description**: Deletes a post by its ID.
- **Arguments**:
  - `id`: `Number` - The ID of the post to be deleted.
  - `userId`: `Number` - The ID of the user attempting to delete the post (passed from authentication).
- **Returns**: `Boolean` - Returns `true` if the post was deleted successfully.
- **Errors**:
  - `NOT_AUTHENTICATED`: User ID not found in payload.
  - `POST_NOT_FOUND`: The specified post was not found.
  - `NOT_AUTHORIZED`: The user is not authorized to delete this post.

```graphql
mutation {
  deletePost(id: 1, userId: 1)
}
```

## Error Handling

Errors are communicated through the ApolloError class, which includes a message and an optional error code. Check the documentation for specific error codes for each operation.

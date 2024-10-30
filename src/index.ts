import "reflect-metadata";
import { AppDataSource } from "./data-source";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolvers } from "./resolvers/UserResolver";
import { PostResolver } from "./resolvers/PostResolver";
import * as jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "./config";
import { JwtPayload } from "./types/AuthContext";

(async () => {
  const app = express();

  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    const schema = await buildSchema({
      resolvers: [UserResolvers, PostResolver],
      validate: false,
    });

    const server = new ApolloServer({
      schema,
      context: ({ req }) => {
        const { authorization } = req.headers;
        if (authorization) {
          const payload = jwt.verify(
            authorization,
            ACCESS_TOKEN_SECRET
          ) as JwtPayload;
          console.log(payload.userId);

          return { userId: payload.userId };
        }
      },
    });

    await server.start();

    server.applyMiddleware({
      app,
      cors: {
        credentials: true,
        origin: "*",
      },
    });

    app.listen(4000, () => {
      console.log("Server started on http://localhost:4000");
    });
  } catch (error) {
    console.error("Server error:", error);
    process.exit(1);
  }
})();

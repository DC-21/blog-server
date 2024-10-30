import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../entity/User";
import { compare, hash } from "bcrypt";
import { ApolloError } from "apollo-server-express";
import { AppDataSource } from "../data-source";
import { sign, verify } from "jsonwebtoken";
import { LoginResponse } from "../types/LoginResponse";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config";

@Resolver()
export class UserResolvers {
  @Query(() => String)
  start() {
    return "Server is live";
  }

  @Mutation(() => String)
  async register(
    @Arg("name") name: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<string> {
    try {
      const userRepository = AppDataSource.getRepository(User);

      const existingUser = await userRepository.findOne({
        where: {
          email: email,
        },
      });

      if (existingUser) {
        throw new ApolloError(
          "User with that email already exists",
          "EMAIL_EXISTS"
        );
      }

      const hashedPassword = await hash(password, 10);

      await userRepository.save({
        name,
        email,
        password: hashedPassword,
      });

      return "User registered successfully";
    } catch (error) {
      throw new ApolloError("Registration failed", "REGISTRATION_FAILED", {
        error: error.message,
      });
    }
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<LoginResponse> {
    try {
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new ApolloError("User not found", "USER_NOT_FOUND");
      }

      const valid = await compare(password, user.password);
      if (!valid) {
        throw new ApolloError("Invalid password", "INVALID_PASSWORD");
      }

      // Generate access token
      console.log(user.id);
      const accessToken = sign({ userId: user.id }, ACCESS_TOKEN_SECRET!, {
        expiresIn: "15m",
      });

      // Generate refresh token
      const refreshToken = sign({ userId: user.id }, REFRESH_TOKEN_SECRET!, {
        expiresIn: "7d",
      });

      await userRepository.update(user.id, {
        refreshToken: refreshToken,
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      throw new ApolloError("Login failed", "LOGIN_FAILED", {
        error: error.message,
      });
    }
  }

  @Mutation(() => String)
  async refreshToken(
    @Arg("refreshToken") refreshToken: string
  ): Promise<string> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const decoded = verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      ) as { userId: number };

      const user = await userRepository.findOne({
        where: {
          id: decoded.userId,
          refreshToken: refreshToken,
        },
      });

      if (!user) {
        throw new ApolloError("Invalid refresh token", "INVALID_REFRESH_TOKEN");
      }

      const accessToken = sign(
        { userId: user.id },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );

      return accessToken;
    } catch (error) {
      throw new ApolloError("Token refresh failed", "TOKEN_REFRESH_FAILED");
    }
  }
}

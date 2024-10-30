import { verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { AuthContext, AuthError } from "../types/AuthContext";
import { ACCESS_TOKEN_SECRET } from "../config";

export const isAuth: MiddlewareFn<AuthContext> = async ({ context }, next) => {
  console.log("=== Auth Middleware Debugging ===");
  const authorization = context.req.headers["authorization"];

  if (!authorization) {
    console.log("Authorization header is missing.");
    throw new AuthError("Not authenticated - No authorization header found.");
  }

  const token = authorization;

  if (!token) {
    console.log("Token is missing from the authorization header.");
    throw new AuthError("Invalid authorization format - Token not found.");
  }

  try {
    const payload = verify(token, ACCESS_TOKEN_SECRET);
    context.payload = payload as { userId: number };
    console.log("Token verified, payload added to context:", context.payload);
  } catch (err) {
    console.log("Token verification failed:", err.message);
    throw new AuthError("Not authenticated - Invalid or expired token.");
  }

  return next();
};

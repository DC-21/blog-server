import { Request } from "express";

export interface AuthContext {
  req: Request;
  payload?: { userId: number };
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface JwtPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

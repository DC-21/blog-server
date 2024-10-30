import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class UserResponse {
  @Field()
  id: number;

  @Field()
  email: string;

  @Field()
  name: string;
}

@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserResponse)
  user: UserResponse;
}

import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entity/Post";
import { AppDataSource } from "../data-source";
import { AuthContext, AuthError } from "../types/AuthContext";
import { User } from "../entity/User";

@Resolver()
export class PostResolver {
  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Arg("content") content: string,
    userId
  ): Promise<Post> {
    if (userId) {
      throw new AuthError("Not authenticated - User ID not found in payload.");
    }

    const postRepository = AppDataSource.getRepository(Post);
    const userRepository = AppDataSource.getRepository(User);

    const author = await userRepository.findOne({
      where: { id: userId },
    });

    if (!author) {
      throw new AuthError("Not authenticated - Author not found.");
    }

    const newPost = postRepository.create({
      title,
      content,
      author,
    });

    try {
      const savedPost = await postRepository.save(newPost);
      console.log("New post created successfully:", savedPost);
      return savedPost;
    } catch (error) {
      throw new Error("An error occurred while creating the post.");
    }
  }

  @Query(() => [Post])
  async getAllPosts(): Promise<Post[]> {
    const postRepository = AppDataSource.getRepository(Post);
    return await postRepository.find({ relations: ["author"] });
  }

  @Query(() => Post, { nullable: true })
  async getPostById(@Arg("id") id: number): Promise<Post | null> {
    const postRepository = AppDataSource.getRepository(Post);
    return await postRepository.findOne({
      where: { id },
      relations: ["author"],
    });
  }

  @Query(() => [Post])
  async getUserPosts(@Arg("userId") userId: number): Promise<Post[]> {
    const postRepository = AppDataSource.getRepository(Post);
    return await postRepository.find({
      where: { author: { id: userId } },
      relations: ["author"],
    });
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number, userId): Promise<boolean> {
    if (!userId) {
      throw new AuthError("Not authenticated - User ID not found in payload.");
    }

    const postRepository = AppDataSource.getRepository(Post);
    const post = await postRepository.findOne({ where: { id } });

    if (!post) {
      throw new Error("Post not found.");
    }

    if (post.author.id !== userId) {
      throw new AuthError(
        "Not authorized - You are not the author of this post."
      );
    }

    await postRepository.delete(id);
    console.log(`Post with ID ${id} has been deleted.`);
    return true;
  }
}

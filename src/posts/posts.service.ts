import { Injectable, UnauthorizedException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User, UserRole } from 'src/auth/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async getAllPosts(): Promise<Post[]> {
    return await this.postRepository.find({
      relations: ['authorName'],
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorName: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    });
  }

  async getPostById(id: number): Promise<Post> {
    const matchingPost = await this.postRepository.findOne({
      where: { id: id },
      relations: ['authorName'],
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorName: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    });
    if (!matchingPost) {
      throw new NotFoundException(`No post found`);
    }
    return matchingPost;
  }

  async createPost(
    newPostObject: CreatePostDto,
    authorName: User,
  ): Promise<Post> {
    const newPost = this.postRepository.create({
      title: newPostObject.title,
      content: newPostObject.content,
      authorName: authorName,
    });
    return this.postRepository.save(newPost);
  }

  async deletePostById(id: number): Promise<void> {
    const postToDelete = await this.getPostById(id);
    if (!postToDelete) {
      throw new NotFoundException(`No post found`);
    }
    await this.postRepository.remove(postToDelete);
  }

  async updatePostById(
    id: number,
    updatePostObject: UpdatePostDto,
    user: User,
  ): Promise<Post> {
    const postToUpdate = await this.getPostById(id);
    if (
      postToUpdate.authorName.id !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      throw new UnauthorizedException(
        `You are not authorized to update this post`,
      );
    }
    if (updatePostObject.title) {
      postToUpdate.title = updatePostObject.title;
    }
    if (updatePostObject.content) {
      postToUpdate.content = updatePostObject.content;
    }

    return this.postRepository.save(postToUpdate);
  }
}

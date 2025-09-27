import { Injectable } from '@nestjs/common';
// import { Post } from './interfaces/post.interface';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async getAllPosts(): Promise<Post[]> {
    return await this.postRepository.find();
  }

  async getPostById(id: number): Promise<Post> {
    const matchingPost = await this.postRepository.findOneBy({ id: id });
    if (!matchingPost) {
      throw new NotFoundException(`No post found`);
    }
    return matchingPost;
  }

  async createPost(newPostObject: CreatePostDto): Promise<Post> {
    const newPost = this.postRepository.create({
      title: newPostObject.title,
      content: newPostObject.content,
      authorName: newPostObject.authorName,
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
  ): Promise<Post> {
    const postToUpdate = await this.getPostById(id);
    if (updatePostObject.title) {
      postToUpdate.title = updatePostObject.title;
    }
    if (updatePostObject.content) {
      postToUpdate.content = updatePostObject.content;
    }
    if (updatePostObject.authorName) {
      postToUpdate.authorName = updatePostObject.authorName;
    }

    return this.postRepository.save(postToUpdate);
  }
}

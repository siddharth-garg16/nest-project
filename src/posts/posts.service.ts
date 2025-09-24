import { Injectable } from '@nestjs/common';
import { Post } from './interfaces/post.interface';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class PostsService {
  private posts: Post[] = [
    {
      id: 1,
      title: 'Welcome Post',
      content: 'This is welcome post used for reference.',
      authorName: 'Admin',
      createdAt: new Date(),
    },
  ];

  getAllPosts(): Post[] {
    return this.posts;
  }

  getPostById(id: number): Post {
    const matchingPost = this.posts.find((post: Post) => post.id === id);
    if (!matchingPost) {
      throw new NotFoundException(`No post found`);
    }
    return matchingPost;
  }

  createPost(newPostObject: Omit<Post, 'id' | 'createdAt'>): Post {
    const newPost = {
      ...newPostObject,
      id: this.getNextId(),
      createdAt: new Date(),
    } as Post;
    this.posts.push(newPost);
    return newPost;
  }

  deletePostById(id: number): Post {
    const index = this.posts.findIndex((post) => post.id === id);
    if (index === -1) {
      throw new NotFoundException(`No post found`);
    }
    const deletedPost = this.posts.splice(index, 1);
    return deletedPost[0];
  }

  updatePostById(
    id: number,
    updatePostObject: Omit<Post, 'id' | 'createdAt'>,
  ): number {
    const postIndexToEdit = this.posts.findIndex((post) => post.id === id);
    if (postIndexToEdit === -1) {
      throw new NotFoundException('No post found');
    }
    this.posts[postIndexToEdit] = {
      ...this.posts[postIndexToEdit],
      ...updatePostObject,
      updatedAt: new Date(),
    };
    return id;
  }

  private getNextId(): number {
    const newId =
      this.posts.length > 0
        ? Math.max(...this.posts.map((post) => post.id)) + 1
        : 1;
    return newId;
  }
}

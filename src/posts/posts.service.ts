import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User, UserRole } from 'src/auth/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FindPostQueryDto } from './dto/find-posts.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination-response.interface';

@Injectable()
export class PostsService {
  private postListCacheKeys: Set<string> = new Set();

  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private generatePostListCacheKey(query: FindPostQueryDto): string {
    const { page = 1, limit = 10, title } = query;
    return `posts_list_page${page}_limit${limit}_title${title || 'all'}`;
  }

  async getAllPosts(
    query: FindPostQueryDto,
  ): Promise<PaginationResponse<Post>> {
    const cacheKey = this.generatePostListCacheKey(query);
    this.postListCacheKeys.add(cacheKey);
    const getCachedData =
      await this.cacheManager.get<PaginationResponse<Post>>(cacheKey);
    if (getCachedData) {
      return getCachedData;
    }

    const { page = 1, limit = 10, title } = query;
    const skip = (page - 1) * limit;
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.authorName', 'author')
      .addSelect(['author.id', 'author.name', 'author.email'])
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (title) {
      queryBuilder.where('post.title ILIKE :title', { title: `%${title}%` });
    }

    const [items, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    const response: PaginationResponse<Post> = {
      items,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };

    await this.cacheManager.set(cacheKey, response, 30000);

    return response;

    // return await this.postRepository.find({
    //   relations: ['authorName'],
    //   select: {
    //     id: true,
    //     title: true,
    //     content: true,
    //     createdAt: true,
    //     updatedAt: true,
    //     authorName: {
    //       id: true,
    //       name: true,
    //       email: true,
    //       role: true,
    //     },
    //   },
    // });
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

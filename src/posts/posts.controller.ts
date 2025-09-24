import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostInterface } from './interfaces/post.interface';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts(@Query('search') search?: string): PostInterface[] {
    const allPosts = this.postsService.getAllPosts();
    if (search) {
      return allPosts.filter((post: PostInterface) =>
        post.title.toLowerCase().includes(search),
      );
    }
    return allPosts;
  }

  @Get(':id')
  getPostById(@Param('id', ParseIntPipe) id: number): PostInterface {
    return this.postsService.getPostById(id);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createPostBody: Omit<PostInterface, 'id' | 'createdAt'>,
  ): PostInterface {
    return this.postsService.createPost(createPostBody);
  }

  @Delete(':id')
  deletePostById(@Param('id', ParseIntPipe) id: number): PostInterface {
    return this.postsService.deletePostById(id);
  }

  @Put(':id')
  updatePostById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostBody: Omit<PostInterface, 'id' | 'createdAt'>,
  ): number {
    return this.postsService.updatePostById(id, updatePostBody);
  }
}

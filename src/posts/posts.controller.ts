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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostInterface } from './interfaces/post.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostExistsPipe } from './pipes/post-exists.pipe';

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
  getPostById(
    @Param('id', ParseIntPipe, PostExistsPipe) id: number,
  ): PostInterface {
    return this.postsService.getPostById(id);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  ) // route level validation pipe - can be used if there is controller specific validations required else global level is good
  create(@Body() createPostBody: CreatePostDto): PostInterface {
    return this.postsService.createPost(createPostBody);
  }

  @Delete(':id')
  deletePostById(
    @Param('id', ParseIntPipe, PostExistsPipe) id: number,
  ): PostInterface {
    return this.postsService.deletePostById(id);
  }

  @Put(':id')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  updatePostById(
    @Param('id', ParseIntPipe, PostExistsPipe) id: number,
    @Body() updatePostBody: UpdatePostDto,
  ): number {
    return this.postsService.updatePostById(id, updatePostBody);
  }
}

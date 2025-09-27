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
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostExistsPipe } from './pipes/post-exists.pipe';
import { Post as PostEntity } from './entities/post.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getAllPosts(): Promise<PostEntity[]> {
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  async getPostById(
    @Param('id', ParseIntPipe, PostExistsPipe) id: number,
  ): Promise<PostEntity> {
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
  async create(@Body() createPostBody: CreatePostDto): Promise<PostEntity> {
    return this.postsService.createPost(createPostBody);
  }

  @Delete(':id')
  async deletePostById(
    @Param('id', ParseIntPipe, PostExistsPipe) id: number,
  ): Promise<void> {
    return this.postsService.deletePostById(id);
  }

  @Put(':id')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async updatePostById(
    @Param('id', ParseIntPipe, PostExistsPipe) id: number,
    @Body() updatePostBody: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.updatePostById(id, updatePostBody);
  }
}

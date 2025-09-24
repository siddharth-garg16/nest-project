import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { PostsService } from '../posts.service';

@Injectable()
export class PostExistsPipe implements PipeTransform {
  constructor(private readonly postService: PostsService) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      this.postService.getPostById(value);
    } catch (err) {
      throw new NotFoundException('Post not found');
    }
    return value;
  }
}

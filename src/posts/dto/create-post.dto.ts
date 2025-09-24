import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Title is required.' })
  @IsString({ message: 'Title must be a string.' })
  @MinLength(10, { message: 'Title must be at least 10 characters long.' })
  @MaxLength(100, {
    message: 'Title can not be longer than 100 characters.',
  })
  title: string;

  @IsNotEmpty({ message: 'Content is required.' })
  @IsString({ message: 'Content must be a string.' })
  @MinLength(100, { message: 'Content must be at least 100 characters long.' })
  @MaxLength(10000, {
    message: 'Content can not be longer than 10000 characters.',
  })
  content: string;

  @IsNotEmpty({ message: 'Author name is required.' })
  @IsString({ message: 'Author name must be a string.' })
  @MinLength(1, { message: 'Author name must be at least 1 characters long.' })
  @MaxLength(100, {
    message: 'Author name can not be longer than 100 characters.',
  })
  authorName: string;
}

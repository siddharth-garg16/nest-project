import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email.' })
  email: string;

  @IsNotEmpty({ message: 'Name is required.' })
  @IsString({ message: 'Please provide a valid name.' })
  @MinLength(1, { message: 'Name must be at least 1 character long.' })
  @MaxLength(50, { message: 'Name can not be longer than 50 characters.' })
  name: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;
}

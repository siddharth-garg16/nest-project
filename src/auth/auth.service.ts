import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcrypt';
import {
  AccessTokenPayload,
  LoginResponse,
  RefreshTokenPayload,
  RegisterResponse,
} from './interfaces/auth.interface';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async registerUser(registerDto: RegisterDto): Promise<RegisterResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use.');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);

    const newUser = this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: UserRole.USER,
    });
    const savedUser = await this.userRepository.save(newUser);
    const { password, ...result } = savedUser; // destructured to remove password

    return {
      user: result,
      message: 'Registered successfully. Please login to continue',
    };
  }

  async createAdmin(registerDto: RegisterDto): Promise<RegisterResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use.');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);

    const newUser = this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    const savedUser = await this.userRepository.save(newUser);
    const { password, ...result } = savedUser; // destructured to remove password

    return {
      user: result,
      message: 'Registered successfully as an admin. Please login to continue',
    };
  }

  async loginUser(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    if (
      !user ||
      !(await this.verifyPassword(loginDto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    // generate tokens
    const tokens = this.generateAccessAndRefreshTokens(user);
    const { password, ...result } = user;
    return {
      user: result,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const payload: RefreshTokenPayload = this.jwtService.verify(
        refreshToken,
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
        },
      );

      const user = await this.userRepository.findOne({
        where: {
          id: payload.sub,
        },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const accessToken = this.generateAccessToken(user);
      return accessToken;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async findCurrentUserById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }
    const { password, ...result } = user;
    return result;
  }

  private async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, 10);
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  private generateAccessAndRefreshTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  private generateAccessToken(user: User): string {
    // email, sub (id), role
    const payload: AccessTokenPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
  }

  private generateRefreshToken(user: User): string {
    // sub (id)
    const payload: RefreshTokenPayload = { sub: user.id };
    return this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
  }
}

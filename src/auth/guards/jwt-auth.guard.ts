import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// protect routes that need auth protection

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/auth/entities/user.entity';

export interface UserRegisteredEvent {
  user: {
    id: number;
    name: string;
    email: string;
  };
  timeStamp: Date;
}

@Injectable()
export class UserEventsService {
  constructor(private readonly eventEmiiter: EventEmitter2) {}

  emitUserRegistered(user: User) {
    const event: UserRegisteredEvent = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      timeStamp: new Date(),
    };
    this.eventEmiiter.emit('user.registered', event);
  }
}

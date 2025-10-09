import { Injectable, Logger } from '@nestjs/common';
import { UserRegisteredEvent } from '../user-events.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserRegisteredListener {
  private readonly logger = new Logger(UserRegisteredListener.name);

  @OnEvent('user.registered')
  handleUserRegisteredEvent(event: UserRegisteredEvent): void {
    const { user, timeStamp } = event;
    this.logger.log(`Welcome! ${user.name}`);
  }
}

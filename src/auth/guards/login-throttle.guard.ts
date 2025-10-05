import { Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LoginThrottleGuard extends ThrottlerGuard {
  protected getTrackerKey(req: Record<string, any>): Promise<string> {
    const email = req.body?.email || 'anonymous'; // currently using email (better use case wwould be IP, via req.ip)
    return Promise.resolve(`login-${email}`); // prefix key with login to differentiate from other throttling
  }

  // set limit
  protected getLimit(): Promise<number> {
    return Promise.resolve(5);
  }

  // time window
  protected getTTL(): Promise<number> {
    return Promise.resolve(60000); // 1 minute
  }

  protected async throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Too many login attempts. Please try again later.',
    );
  }
}

import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email'
    });
  }
  validate(email: string, password: string): any {
    if (password === '')
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Please provide your password.'
      });
    return this.authService.validateLocalUser(email, password);
  }
}

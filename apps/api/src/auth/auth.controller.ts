import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { AuthenticatedRequest } from './types/extended-request.interface';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { Response } from 'express';
import { Public } from './decorator/public.decorator';
import { Roles } from './decorator/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  login(@Req() req: AuthenticatedRequest) {
    return this.authService.login(
      req.user.id,
      req.user.name as string,
      req.user.role
    );
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req: AuthenticatedRequest) {
    return this.authService.refreshToken(req.user.id, req.user.name);
  }

  @Roles('ADMIN', 'EDITOR')
  @Get('protected')
  getAll(@Req() req: AuthenticatedRequest) {
    return {
      message: `Now you can access this protected API. Your user Id id: ${req.user.id}`
    };
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const response = await this.authService.login(
      req.user.id,
      req.user.name as string,
      req.user.role
    );
    res.redirect(
      `http://localhost:3000/api/auth/google/callback?userId=${response.id}&name=${response.name}&accessToken=${response.accessToken}&refreshToken=${response.refreshToken}&role=${response.role}`
    );
  }

  @Post('signout')
  signout(@Req() req: AuthenticatedRequest) {
    return this.authService.signout(req.user.id);
  }
}

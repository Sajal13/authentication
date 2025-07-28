import {
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from './types/auth-jwt';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from './config/refresh.config';
import { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email
    );
    if (existingUser)
      throw new ConflictException({
        status: HttpStatus.CONFLICT,
        message: 'User already exists'
      });
    return await this.userService.create(createUserDto);
  }

  async login(userId: number, name: string, role: Role) {
    const { accessToken, refreshToken } = await this.generateToke(userId);

    const hashedRT = await bcrypt.hash(refreshToken, 10);

    await this.userService.updateHashedRefreshToken(userId, hashedRT);
    return {
      id: userId,
      name,
      role,
      accessToken,
      refreshToken
    };
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new ConflictException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials'
      });
    }
    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new ConflictException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials'
      });
    }
    return { id: user.id, name: user.name, role: user.role };
  }

  async generateToke(userId: number) {
    const payload: JwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig)
    ]);

    return {
      accessToken,
      refreshToken
    };
  }

  async validateJwtUser(userId: number) {
    const user = await this.userService.findOne(userId);

    if (!user)
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'User Not Found'
      });

    return {
      id: user.id,
      role: user.role
    };
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findOne(userId);

    if (!user)
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'User Not Found'
      });

    if (!user.hashedRefreshToken) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Refresh token not found'
      });
    }
    const refreshTokenMatched = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken
    );

    if (!refreshTokenMatched)
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Refresh does not match'
      });
    return {
      id: user.id
    };
  }

  async refreshToken(userId: number, name: string | null) {
    const { accessToken, refreshToken } = await this.generateToke(userId);

    const hashedRT = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateHashedRefreshToken(userId, hashedRT);

    return {
      id: userId,
      name,
      accessToken,
      refreshToken
    };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findByEmail(googleUser.email);

    if (user) return user;

    return await this.userService.create(googleUser);
  }

  async signout(userId: number) {
    return this.userService.updateHashedRefreshToken(userId, null);
  }
}

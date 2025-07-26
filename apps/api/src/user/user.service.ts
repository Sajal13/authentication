import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email }
    });
  }

  async validatePassword(
    plainTextPassword: string,
    hashedPassword: string | null
  ) {
    if (!hashedPassword) {
      return false;
    }
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async findOne(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    return user;
  }

  async updateHashedRefreshToken(userId: number, hashedRT: string | null) {
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        hashedRefreshToken: hashedRT
      }
    });
  }
}

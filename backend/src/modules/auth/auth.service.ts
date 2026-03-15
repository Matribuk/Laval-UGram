import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto, AuthResponseDto } from './dto';
import { UserResponseDto } from '../users/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.usersService.validatePassword(user, password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    return this.generateAuthResponse(user);
  }

  async login(user: User): Promise<AuthResponseDto> {
    return this.generateAuthResponse(user);
  }

  async googleLogin(googleProfile: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
  }): Promise<AuthResponseDto> {
    const user = await this.usersService.findOrCreateOAuthUser({
      email: googleProfile.email,
      firstName: googleProfile.firstName,
      lastName: googleProfile.lastName,
      profilePictureUrl: googleProfile.picture,
    });

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: User): AuthResponseDto {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: plainToInstance(UserResponseDto, user),
    };
  }
}

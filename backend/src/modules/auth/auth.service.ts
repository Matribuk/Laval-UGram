import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { AnalyticsService } from '../monitoring/analytics.service';
import { RegisterDto, AuthResponseDto } from './dto';
import { UserResponseDto } from '../users/dto';

const OAUTH_NEW_USER_WINDOW_MS = 60_000;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly analytics: AnalyticsService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      password,
    );
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

    this.analytics.trackSignup();

    return this.generateAuthResponse(user);
  }

  login(user: User): Promise<AuthResponseDto> {
    this.analytics.trackLogin();
    return Promise.resolve(this.generateAuthResponse(user));
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

    const isNewUser =
      user.createdAt &&
      Date.now() - new Date(user.createdAt).getTime() <
        OAUTH_NEW_USER_WINDOW_MS;
    if (isNewUser) {
      this.analytics.trackSignup();
    } else {
      this.analytics.trackLogin();
    }

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

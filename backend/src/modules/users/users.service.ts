import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepository, UserWithScore } from './users.repository';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';

export interface OAuthUserData {
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
}

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.validateUniqueConstraints(createUserDto.email, createUserDto.username);

    const passwordHash = await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS);

    return this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      passwordHash,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
    });
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.usersRepository.findAll(page, limit);
    return { users, total };
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  async searchByUsername(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.usersRepository.searchByUsername(query, page, limit);
    return { users, total };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = await this.usersRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return updatedUser;
  }

  async updateProfilePicture(id: string, url: string): Promise<User> {
    await this.findById(id);
    const updatedUser = await this.usersRepository.updateProfilePicture(id, url);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return updatedUser;
  }

  async getRecommendedUsers(currentUserId: string, limit: number = 5): Promise<UserWithScore[]> {
    return this.usersRepository.findRecommended(currentUserId, limit);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async findOrCreateOAuthUser(oauthData: OAuthUserData): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(oauthData.email);

    if (existingUser) {
      return existingUser;
    }

    const randomPassword = uuidv4();
    const passwordHash = await bcrypt.hash(randomPassword, this.SALT_ROUNDS);

    const username = await this.generateUniqueUsername(oauthData.email);

    return this.usersRepository.create({
      username,
      email: oauthData.email,
      passwordHash,
      firstName: oauthData.firstName,
      lastName: oauthData.lastName,
      profilePictureUrl: oauthData.profilePictureUrl,
    });
  }

  private async generateUniqueUsername(email: string): Promise<string> {
    const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    let username = baseUsername;
    let counter = 1;

    while (await this.usersRepository.existsByUsername(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }

  private async validateUniqueConstraints(email: string, username: string): Promise<void> {
    const [emailExists, usernameExists] = await Promise.all([
      this.usersRepository.existsByEmail(email),
      this.usersRepository.existsByUsername(username),
    ]);

    if (emailExists) {
      throw new ConflictException('Email already registered');
    }

    if (usernameExists) {
      throw new ConflictException('Username already taken');
    }
  }
}

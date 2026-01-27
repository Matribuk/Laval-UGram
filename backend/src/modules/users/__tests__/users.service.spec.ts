import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users.service';
import { UsersRepository } from '../users.repository';
import {
  createUserFactory,
  createUserDtoFactory,
  createManyUsers,
} from '../../../../test/factories/user.factory';
import { createMockUsersRepository } from '../../../../test/mocks/services.mock';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: ReturnType<typeof createMockUsersRepository>;

  beforeEach(async () => {
    repository = createMockUsersRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = createUserDtoFactory();

    it('should hash password with bcrypt using 10 salt rounds', async () => {
      
      const hashedPassword = '$2b$10$hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      repository.existsByEmail.mockResolvedValue(false);
      repository.existsByUsername.mockResolvedValue(false);
      repository.create.mockResolvedValue(createUserFactory());

      
      await service.create(createUserDto);

      
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should create user with hashed password', async () => {
      
      const hashedPassword = '$2b$10$hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      repository.existsByEmail.mockResolvedValue(false);
      repository.existsByUsername.mockResolvedValue(false);
      const expectedUser = createUserFactory({ passwordHash: hashedPassword });
      repository.create.mockResolvedValue(expectedUser);

      
      const result = await service.create(createUserDto);

      
      expect(repository.create).toHaveBeenCalledWith({
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      
      repository.existsByEmail.mockResolvedValue(true);
      repository.existsByUsername.mockResolvedValue(false);

      
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createUserDto)).rejects.toThrow('Email already registered');
    });

    it('should throw ConflictException when username already taken', async () => {
      
      repository.existsByEmail.mockResolvedValue(false);
      repository.existsByUsername.mockResolvedValue(true);

      
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createUserDto)).rejects.toThrow('Username already taken');
    });

    it('should check email uniqueness before username uniqueness', async () => {
      
      repository.existsByEmail.mockResolvedValue(true);
      repository.existsByUsername.mockResolvedValue(true);

      
      await expect(service.create(createUserDto)).rejects.toThrow('Email already registered');
    });

    it('should check both email and username concurrently', async () => {
      
      repository.existsByEmail.mockResolvedValue(false);
      repository.existsByUsername.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      repository.create.mockResolvedValue(createUserFactory());

      
      await service.create(createUserDto);

      
      expect(repository.existsByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.existsByUsername).toHaveBeenCalledWith(createUserDto.username);
    });
  });

  describe('findAll', () => {
    it('should return paginated users with total count', async () => {
      
      const users = createManyUsers(3);
      const total = 10;
      repository.findAll.mockResolvedValue([users, total]);

      
      const result = await service.findAll(1, 3);

      
      expect(result).toEqual({ users, total });
      expect(repository.findAll).toHaveBeenCalledWith(1, 3);
    });

    it('should use default page 1 when not provided', async () => {
      
      repository.findAll.mockResolvedValue([[], 0]);

      
      await service.findAll();

      
      expect(repository.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should use default limit 10 when not provided', async () => {
      
      repository.findAll.mockResolvedValue([[], 0]);

      
      await service.findAll(2);

      
      expect(repository.findAll).toHaveBeenCalledWith(2, 10);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      
      const mockUser = createUserFactory();
      repository.findById.mockResolvedValue(mockUser);

      
      const result = await service.findById(mockUser.id);

      
      expect(result).toEqual(mockUser);
      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException when user not found', async () => {
      
      const userId = 'non-existent-id';
      repository.findById.mockResolvedValue(null);

      
      await expect(service.findById(userId)).rejects.toThrow(NotFoundException);
      await expect(service.findById(userId)).rejects.toThrow(
        `User with ID "${userId}" not found`,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when email exists', async () => {
      
      const mockUser = createUserFactory();
      repository.findByEmail.mockResolvedValue(mockUser);

      
      const result = await service.findByEmail(mockUser.email);

      
      expect(result).toEqual(mockUser);
      expect(repository.findByEmail).toHaveBeenCalledWith(mockUser.email);
    });

    it('should return null when email not found', async () => {
      
      repository.findByEmail.mockResolvedValue(null);

      
      const result = await service.findByEmail('nonexistent@example.com');

      
      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user when username exists', async () => {
      
      const mockUser = createUserFactory();
      repository.findByUsername.mockResolvedValue(mockUser);

      
      const result = await service.findByUsername(mockUser.username);

      
      expect(result).toEqual(mockUser);
    });

    it('should return null when username not found', async () => {
      
      repository.findByUsername.mockResolvedValue(null);

      
      const result = await service.findByUsername('nonexistent');

      
      expect(result).toBeNull();
    });
  });

  describe('searchByUsername', () => {
    it('should return users matching search query', async () => {
      
      const users = createManyUsers(2);
      repository.searchByUsername.mockResolvedValue([users, 2]);

      
      const result = await service.searchByUsername('test', 1, 10);

      
      expect(result).toEqual({ users, total: 2 });
      expect(repository.searchByUsername).toHaveBeenCalledWith('test', 1, 10);
    });

    it('should support pagination for search results', async () => {
      
      repository.searchByUsername.mockResolvedValue([[], 0]);

      
      await service.searchByUsername('query', 2, 5);

      
      expect(repository.searchByUsername).toHaveBeenCalledWith('query', 2, 5);
    });

    it('should return empty array when no matches found', async () => {
      
      repository.searchByUsername.mockResolvedValue([[], 0]);

      
      const result = await service.searchByUsername('nonexistent');

      
      expect(result).toEqual({ users: [], total: 0 });
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      
      const existingUser = createUserFactory();
      const updateDto = { firstName: 'Updated', lastName: 'Name' };
      const updatedUser = { ...existingUser, ...updateDto };
      repository.findById.mockResolvedValue(existingUser);
      repository.update.mockResolvedValue(updatedUser);

      
      const result = await service.update(existingUser.id, updateDto);

      
      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith(existingUser.id, updateDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      
      repository.findById.mockResolvedValue(null);

      
      await expect(service.update('invalid-id', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when new email already in use', async () => {
      
      const existingUser = createUserFactory({ email: 'original@example.com' });
      const otherUser = createUserFactory({ email: 'taken@example.com' });
      repository.findById.mockResolvedValue(existingUser);
      repository.findByEmail.mockResolvedValue(otherUser);

      
      await expect(
        service.update(existingUser.id, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(existingUser.id, { email: 'taken@example.com' }),
      ).rejects.toThrow('Email already in use');
    });

    it('should allow same email if unchanged', async () => {
      
      const existingUser = createUserFactory({ email: 'same@example.com' });
      repository.findById.mockResolvedValue(existingUser);
      repository.update.mockResolvedValue(existingUser);

      
      const result = await service.update(existingUser.id, { email: 'same@example.com' });

      
      expect(result).toEqual(existingUser);
      expect(repository.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if update returns null', async () => {
      
      const existingUser = createUserFactory();
      repository.findById.mockResolvedValue(existingUser);
      repository.update.mockResolvedValue(null);

      
      await expect(service.update(existingUser.id, { firstName: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfilePicture', () => {
    it('should update user profile picture url', async () => {
      
      const user = createUserFactory();
      const newUrl = '/uploads/new-picture.jpg';
      const updatedUser = { ...user, profilePictureUrl: newUrl };
      repository.findById.mockResolvedValue(user);
      repository.updateProfilePicture.mockResolvedValue(updatedUser);

      
      const result = await service.updateProfilePicture(user.id, newUrl);

      
      expect(result).toEqual(updatedUser);
      expect(repository.updateProfilePicture).toHaveBeenCalledWith(user.id, newUrl);
    });

    it('should throw NotFoundException when user not found', async () => {
      
      repository.findById.mockResolvedValue(null);

      
      await expect(
        service.updateProfilePicture('invalid-id', '/uploads/pic.jpg'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if updateProfilePicture returns null', async () => {
      
      const user = createUserFactory();
      repository.findById.mockResolvedValue(user);
      repository.updateProfilePicture.mockResolvedValue(null);

      
      await expect(
        service.updateProfilePicture(user.id, '/uploads/pic.jpg'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      
      repository.delete.mockResolvedValue(true);

      
      await service.delete('user-id');

      
      expect(repository.delete).toHaveBeenCalledWith('user-id');
    });

    it('should throw NotFoundException when user not found', async () => {
      
      repository.delete.mockResolvedValue(false);

      
      await expect(service.delete('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validatePassword', () => {
    it('should return true when password matches hash', async () => {
      
      const user = createUserFactory({ passwordHash: '$2b$10$hashedPassword' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      
      const result = await service.validatePassword(user, 'correctPassword');

      
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', user.passwordHash);
    });

    it('should return false when password does not match', async () => {
      
      const user = createUserFactory({ passwordHash: '$2b$10$hashedPassword' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      
      const result = await service.validatePassword(user, 'wrongPassword');

      
      expect(result).toBe(false);
    });

    it('should use bcrypt.compare for validation', async () => {
      
      const user = createUserFactory();
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      
      await service.validatePassword(user, 'anyPassword');

      
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });
  });
});

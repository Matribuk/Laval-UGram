import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersRepository } from '../users.repository';
import { User } from '../entities/user.entity';
import { createUserFactory } from '../../../../test/factories/user.factory';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let mockTypeOrmRepository: any;

  beforeEach(async () => {
    mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return the created user with generated id', async () => {
      const userData = { username: 'test', email: 'test@example.com' };
      const savedUser = createUserFactory({ id: 'generated-uuid', ...userData });
      mockTypeOrmRepository.create.mockReturnValue(savedUser);
      mockTypeOrmRepository.save.mockResolvedValue(savedUser);

      const result = await repository.create(userData);

      expect(result.id).toBe('generated-uuid');
      expect(result.username).toBe('test');
    });
  });

  describe('findAll', () => {
    it('should return users and total count', async () => {
      const users = [createUserFactory(), createUserFactory()];
      mockTypeOrmRepository.findAndCount.mockResolvedValue([users, 10]);

      const result = await repository.findAll(1, 10);

      expect(result[0]).toHaveLength(2);
      expect(result[1]).toBe(10);
    });

    it('should return empty array when no users exist', async () => {
      mockTypeOrmRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await repository.findAll();

      expect(result[0]).toEqual([]);
      expect(result[1]).toBe(0);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = createUserFactory({ id: 'user-123' });
      mockTypeOrmRepository.findOne.mockResolvedValue(user);

      const result = await repository.findById('user-123');

      expect(result?.id).toBe('user-123');
    });

    it('should return null when user not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user when email exists', async () => {
      const user = createUserFactory({ email: 'test@example.com' });
      mockTypeOrmRepository.findOne.mockResolvedValue(user);

      const result = await repository.findByEmail('test@example.com');

      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when email not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user when username exists', async () => {
      const user = createUserFactory({ username: 'testuser' });
      mockTypeOrmRepository.findOne.mockResolvedValue(user);

      const result = await repository.findByUsername('testuser');

      expect(result?.username).toBe('testuser');
    });

    it('should return null when username not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should return updated user', async () => {
      const user = createUserFactory({ firstName: 'Original' });
      const updatedUser = { ...user, firstName: 'Updated' };
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeOrmRepository.findOne.mockResolvedValue(updatedUser);

      const result = await repository.update(user.id, { firstName: 'Updated' });

      expect(result?.firstName).toBe('Updated');
    });

    it('should return null when user not found', async () => {
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 0 });
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.update('non-existent', { firstName: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('updateProfilePicture', () => {
    it('should return user with updated profile picture URL', async () => {
      const user = createUserFactory();
      const newUrl = '/uploads/new-picture.jpg';
      const updatedUser = { ...user, profilePictureUrl: newUrl };
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeOrmRepository.findOne.mockResolvedValue(updatedUser);

      const result = await repository.updateProfilePicture(user.id, newUrl);

      expect(result?.profilePictureUrl).toBe(newUrl);
    });
  });

  describe('delete', () => {
    it('should return true when user deleted', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await repository.delete('user-id');

      expect(result).toBe(true);
    });

    it('should return false when user not found', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });

    it('should return false when affected is undefined', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({});

      const result = await repository.delete('user-id');

      expect(result).toBe(false);
    });
  });

  describe('existsByEmail', () => {
    it('should return true when email exists', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(1);

      const result = await repository.existsByEmail('exists@example.com');

      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(0);

      const result = await repository.existsByEmail('notfound@example.com');

      expect(result).toBe(false);
    });
  });

  describe('existsByUsername', () => {
    it('should return true when username exists', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(1);

      const result = await repository.existsByUsername('existinguser');

      expect(result).toBe(true);
    });

    it('should return false when username does not exist', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(0);

      const result = await repository.existsByUsername('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('searchByUsername', () => {
    it('should return matching users and count', async () => {
      const users = [createUserFactory({ username: 'testuser' })];
      mockTypeOrmRepository.findAndCount.mockResolvedValue([users, 1]);

      const result = await repository.searchByUsername('test', 1, 10);

      expect(result[0]).toHaveLength(1);
      expect(result[1]).toBe(1);
    });

    it('should return empty results when no matches', async () => {
      mockTypeOrmRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await repository.searchByUsername('nonexistent', 1, 10);

      expect(result[0]).toEqual([]);
      expect(result[1]).toBe(0);
    });
  });
});

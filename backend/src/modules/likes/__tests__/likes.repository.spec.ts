import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikesRepository } from '../likes.repository';
import { Like } from '../entities/like.entity';
import { createLikeFactory, createImageFactory } from '../../../../test/factories';

const mockTypeOrmRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  findAndCount: jest.fn(),
});

describe('LikesRepository', () => {
  let repository: LikesRepository;
  let likeRepo: jest.Mocked<Repository<Like>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesRepository,
        { provide: getRepositoryToken(Like), useFactory: mockTypeOrmRepository },
      ],
    }).compile();

    repository = module.get<LikesRepository>(LikesRepository);
    likeRepo = module.get(getRepositoryToken(Like));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a like', async () => {
      const like = createLikeFactory();
      likeRepo.create.mockReturnValue(like);
      likeRepo.save.mockResolvedValue(like);

      const result = await repository.create('user-id', 'image-id');

      expect(likeRepo.create).toHaveBeenCalledWith({ userId: 'user-id', imageId: 'image-id' });
      expect(likeRepo.save).toHaveBeenCalledWith(like);
      expect(result).toEqual(like);
    });
  });

  describe('delete', () => {
    it('should delete a like by userId and imageId', async () => {
      likeRepo.delete.mockResolvedValue({ affected: 1, raw: {} });

      await repository.delete('user-id', 'image-id');

      expect(likeRepo.delete).toHaveBeenCalledWith({ userId: 'user-id', imageId: 'image-id' });
    });
  });

  describe('countByImageId', () => {
    it('should return the count of likes for an image', async () => {
      likeRepo.count.mockResolvedValue(5);

      const result = await repository.countByImageId('image-id');

      expect(likeRepo.count).toHaveBeenCalledWith({ where: { imageId: 'image-id' } });
      expect(result).toBe(5);
    });

    it('should return 0 when no likes exist', async () => {
      likeRepo.count.mockResolvedValue(0);

      const result = await repository.countByImageId('image-id');

      expect(result).toBe(0);
    });
  });

  describe('existsByUserAndImage', () => {
    it('should return true when like exists', async () => {
      likeRepo.count.mockResolvedValue(1);

      const result = await repository.existsByUserAndImage('user-id', 'image-id');

      expect(result).toBe(true);
    });

    it('should return false when like does not exist', async () => {
      likeRepo.count.mockResolvedValue(0);

      const result = await repository.existsByUserAndImage('user-id', 'image-id');

      expect(result).toBe(false);
    });
  });

  describe('findLikedImagesByUserId', () => {
    it('should return paginated images liked by a user', async () => {
      const image = createImageFactory();
      const like = createLikeFactory({ image });
      likeRepo.findAndCount.mockResolvedValue([[like], 1]);

      const [images, total] = await repository.findLikedImagesByUserId('user-id', 1, 10);

      expect(likeRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-id' }, skip: 0, take: 10 }),
      );
      expect(images).toEqual([image]);
      expect(total).toBe(1);
    });

    it('should apply correct pagination offset', async () => {
      likeRepo.findAndCount.mockResolvedValue([[], 0]);

      await repository.findLikedImagesByUserId('user-id', 3, 5);

      expect(likeRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });
});

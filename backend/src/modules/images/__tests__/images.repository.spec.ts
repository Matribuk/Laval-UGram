import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImagesRepository } from '../images.repository';
import { Image, Hashtag, ImageMention } from '../entities';
import { Like } from '../../likes/entities/like.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { createImageFactory, createHashtagFactory } from '../../../../test/factories/image.factory';
import { createUserFactory } from '../../../../test/factories/user.factory';

describe('ImagesRepository', () => {
  let repository: ImagesRepository;
  let mockImageRepository: any;
  let mockHashtagRepository: any;
  let mockMentionRepository: any;
  let mockLikeRepository: any;
  let mockCommentRepository: any;

  beforeEach(async () => {
    mockImageRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockHashtagRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    mockMentionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };

    mockLikeRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    mockCommentRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesRepository,
        { provide: getRepositoryToken(Image), useValue: mockImageRepository },
        { provide: getRepositoryToken(Hashtag), useValue: mockHashtagRepository },
        { provide: getRepositoryToken(ImageMention), useValue: mockMentionRepository },
        { provide: getRepositoryToken(Like), useValue: mockLikeRepository },
        { provide: getRepositoryToken(Comment), useValue: mockCommentRepository },
      ],
    }).compile();

    repository = module.get<ImagesRepository>(ImagesRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return the created image', async () => {
      const imageData = { url: '/uploads/test.jpg', description: 'Test' };
      const createdImage = createImageFactory(imageData);
      mockImageRepository.create.mockReturnValue(createdImage);
      mockImageRepository.save.mockResolvedValue(createdImage);

      const result = await repository.create(imageData);

      expect(result.url).toBe('/uploads/test.jpg');
      expect(result.description).toBe('Test');
    });
  });

  describe('findAll', () => {
    it('should return images and total count', async () => {
      const images = [createImageFactory(), createImageFactory()];
      mockImageRepository.findAndCount.mockResolvedValue([images, 10]);

      const result = await repository.findAll(1, 10);

      expect(result[0]).toHaveLength(2);
      expect(result[1]).toBe(10);
    });

    it('should return empty array when no images exist', async () => {
      mockImageRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await repository.findAll(1, 10);

      expect(result[0]).toEqual([]);
      expect(result[1]).toBe(0);
    });
  });

  describe('findById', () => {
    it('should return image when found', async () => {
      const image = createImageFactory({ id: 'image-123' });
      mockImageRepository.findOne.mockResolvedValue(image);

      const result = await repository.findById('image-123');

      expect(result?.id).toBe('image-123');
    });

    it('should return null when not found', async () => {
      mockImageRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return user images and count', async () => {
      const user = createUserFactory();
      const images = [createImageFactory({ userId: user.id })];
      mockImageRepository.findAndCount.mockResolvedValue([images, 1]);

      const result = await repository.findByUserId(user.id, 1, 10);

      expect(result[0]).toHaveLength(1);
      expect(result[1]).toBe(1);
    });
  });

  describe('update', () => {
    it('should return updated image', async () => {
      const image = createImageFactory();
      const updatedImage = { ...image, description: 'Updated' };
      mockImageRepository.update.mockResolvedValue({ affected: 1 });
      mockImageRepository.findOne.mockResolvedValue(updatedImage);

      const result = await repository.update(image.id, { description: 'Updated' });

      expect(result?.description).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should return true when image deleted', async () => {
      mockImageRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await repository.delete('image-id');

      expect(result).toBe(true);
    });

    it('should return false when image not found', async () => {
      mockImageRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });

    it('should return false when affected is undefined', async () => {
      mockImageRepository.delete.mockResolvedValue({});

      const result = await repository.delete('image-id');

      expect(result).toBe(false);
    });
  });

  describe('findOrCreateHashtags', () => {
    it('should return empty array for empty input', async () => {
      const result = await repository.findOrCreateHashtags([]);

      expect(result).toEqual([]);
    });

    it('should return empty array for null input', async () => {
      const result = await repository.findOrCreateHashtags(null as any);

      expect(result).toEqual([]);
    });

    it('should return existing hashtags without creating new ones', async () => {
      const existingHashtags = [createHashtagFactory('nature'), createHashtagFactory('photo')];
      mockHashtagRepository.find.mockResolvedValue(existingHashtags);

      const result = await repository.findOrCreateHashtags(['nature', 'photo']);

      expect(result).toEqual(existingHashtags);
      expect(mockHashtagRepository.save).not.toHaveBeenCalled();
    });

    it('should create new hashtags when they do not exist', async () => {
      mockHashtagRepository.find.mockResolvedValue([]);
      const newHashtag = createHashtagFactory('newhashtag');
      mockHashtagRepository.create.mockReturnValue(newHashtag);
      mockHashtagRepository.save.mockResolvedValue([newHashtag]);

      const result = await repository.findOrCreateHashtags(['newhashtag']);

      expect(result).toContain(newHashtag);
    });

    it('should combine existing and newly created hashtags', async () => {
      const existingHashtag = createHashtagFactory('existing');
      mockHashtagRepository.find.mockResolvedValue([existingHashtag]);
      const newHashtag = createHashtagFactory('new');
      mockHashtagRepository.create.mockReturnValue(newHashtag);
      mockHashtagRepository.save.mockResolvedValue([newHashtag]);

      const result = await repository.findOrCreateHashtags(['existing', 'new']);

      expect(result).toContain(existingHashtag);
    });
  });

  describe('updateImageHashtags', () => {
    it('should update hashtags on existing image', async () => {
      const image = createImageFactory();
      const newHashtags = [createHashtagFactory('new1'), createHashtagFactory('new2')];
      mockImageRepository.findOne.mockResolvedValue(image);
      mockImageRepository.save.mockResolvedValue({ ...image, hashtags: newHashtags });

      await repository.updateImageHashtags(image.id, newHashtags);

      expect(mockImageRepository.save).toHaveBeenCalled();
    });

    it('should not save when image not found', async () => {
      mockImageRepository.findOne.mockResolvedValue(null);

      await repository.updateImageHashtags('non-existent', []);

      expect(mockImageRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateImageMentions', () => {
    it('should replace mentions with new user ids', async () => {
      mockMentionRepository.delete.mockResolvedValue({ affected: 1 });
      mockMentionRepository.create.mockImplementation((data) => data);
      mockMentionRepository.save.mockResolvedValue([]);

      await repository.updateImageMentions('image-id', ['user-1', 'user-2']);

      expect(mockMentionRepository.delete).toHaveBeenCalled();
      expect(mockMentionRepository.save).toHaveBeenCalled();
    });

    it('should only delete when user ids array is empty', async () => {
      mockMentionRepository.delete.mockResolvedValue({ affected: 0 });

      await repository.updateImageMentions('image-id', []);

      expect(mockMentionRepository.delete).toHaveBeenCalled();
      expect(mockMentionRepository.save).not.toHaveBeenCalled();
    });

    it('should handle null user ids', async () => {
      mockMentionRepository.delete.mockResolvedValue({ affected: 0 });

      await repository.updateImageMentions('image-id', null as any);

      expect(mockMentionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getImageFilename', () => {
    it('should extract filename from URL path', async () => {
      const image = { url: '/uploads/image-123.jpg' };
      mockImageRepository.findOne.mockResolvedValue(image);

      const result = await repository.getImageFilename('image-id');

      expect(result).toBe('image-123.jpg');
    });

    it('should return null when image not found', async () => {
      mockImageRepository.findOne.mockResolvedValue(null);

      const result = await repository.getImageFilename('non-existent');

      expect(result).toBeNull();
    });

    it('should handle full URLs with multiple path segments', async () => {
      const image = { url: 'https://example.com/path/to/image.jpg' };
      mockImageRepository.findOne.mockResolvedValue(image);

      const result = await repository.getImageFilename('image-id');

      expect(result).toBe('image.jpg');
    });
  });

  describe('findByHashtag', () => {
    it('should return images matching the hashtag', async () => {
      const images = [createImageFactory()];
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([images, 1]),
      };
      mockImageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findByHashtag('nature', 1, 10);

      expect(result[0]).toHaveLength(1);
      expect(result[1]).toBe(1);
    });

    it('should return empty results when no images match', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockImageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findByHashtag('nonexistent', 1, 10);

      expect(result[0]).toEqual([]);
      expect(result[1]).toBe(0);
    });
  });
});

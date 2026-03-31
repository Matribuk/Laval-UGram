import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LikesService } from '../likes.service';
import { LikesRepository } from '../likes.repository';
import { createMockLikesRepository } from '../../../../test/mocks/services.mock';
import { createImageFactory } from '../../../../test/factories';

describe('LikesService', () => {
  let service: LikesService;
  let likesRepository: ReturnType<typeof createMockLikesRepository>;

  beforeEach(async () => {
    likesRepository = createMockLikesRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        { provide: LikesRepository, useValue: likesRepository },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
    jest.clearAllMocks();
  });

  describe('addLike', () => {
    it('should add a like and return updated status', async () => {
      likesRepository.existsByUserAndImage.mockResolvedValue(false);
      likesRepository.create.mockResolvedValue(undefined);
      likesRepository.countByImageId.mockResolvedValue(1);

      const result = await service.addLike('user-id', 'image-id');

      expect(likesRepository.existsByUserAndImage).toHaveBeenCalledWith('user-id', 'image-id');
      expect(likesRepository.create).toHaveBeenCalledWith('user-id', 'image-id');
      expect(result).toEqual({ likeCount: 1, likedByCurrentUser: true });
    });

    it('should throw ConflictException if already liked', async () => {
      likesRepository.existsByUserAndImage.mockResolvedValue(true);

      await expect(service.addLike('user-id', 'image-id')).rejects.toThrow(ConflictException);
      expect(likesRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('removeLike', () => {
    it('should remove a like and return updated status', async () => {
      likesRepository.existsByUserAndImage.mockResolvedValue(true);
      likesRepository.delete.mockResolvedValue(undefined);
      likesRepository.countByImageId.mockResolvedValue(0);

      const result = await service.removeLike('user-id', 'image-id');

      expect(likesRepository.delete).toHaveBeenCalledWith('user-id', 'image-id');
      expect(result).toEqual({ likeCount: 0, likedByCurrentUser: false });
    });

    it('should throw NotFoundException if like does not exist', async () => {
      likesRepository.existsByUserAndImage.mockResolvedValue(false);

      await expect(service.removeLike('user-id', 'image-id')).rejects.toThrow(NotFoundException);
      expect(likesRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getLikeStatus', () => {
    it('should return like count and whether current user liked the image', async () => {
      likesRepository.countByImageId.mockResolvedValue(3);
      likesRepository.existsByUserAndImage.mockResolvedValue(true);

      const result = await service.getLikeStatus('user-id', 'image-id');

      expect(result).toEqual({ likeCount: 3, likedByCurrentUser: true });
    });

    it('should return likedByCurrentUser false when user has not liked', async () => {
      likesRepository.countByImageId.mockResolvedValue(2);
      likesRepository.existsByUserAndImage.mockResolvedValue(false);

      const result = await service.getLikeStatus('user-id', 'image-id');

      expect(result).toEqual({ likeCount: 2, likedByCurrentUser: false });
    });

    it('should call count and exists in parallel', async () => {
      likesRepository.countByImageId.mockResolvedValue(0);
      likesRepository.existsByUserAndImage.mockResolvedValue(false);

      await service.getLikeStatus('user-id', 'image-id');

      expect(likesRepository.countByImageId).toHaveBeenCalledWith('image-id');
      expect(likesRepository.existsByUserAndImage).toHaveBeenCalledWith('user-id', 'image-id');
    });
  });

  describe('getLikedImages', () => {
    it('should return paginated liked images', async () => {
      const images = [createImageFactory(), createImageFactory()];
      likesRepository.findLikedImagesByUserId.mockResolvedValue([images, 2]);

      const result = await service.getLikedImages('user-id', 1, 10);

      expect(likesRepository.findLikedImagesByUserId).toHaveBeenCalledWith('user-id', 1, 10);
      expect(result).toEqual({ images, total: 2 });
    });

    it('should return empty list when user has no liked images', async () => {
      likesRepository.findLikedImagesByUserId.mockResolvedValue([[], 0]);

      const result = await service.getLikedImages('user-id', 1, 10);

      expect(result).toEqual({ images: [], total: 0 });
    });
  });
});

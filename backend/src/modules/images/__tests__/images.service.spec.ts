import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ImagesService } from '../images.service';
import { ImagesRepository } from '../images.repository';
import { StorageService } from '../../storage/storage.service';
import {
  createImageFactory,
  createMockFile,
  createHashtagFactory,
  createManyImages,
} from '../../../../test/factories/image.factory';
import { createUserFactory } from '../../../../test/factories/user.factory';
import {
  createMockImagesRepository,
  createMockStorageService,
} from '../../../../test/mocks/services.mock';

describe('ImagesService', () => {
  let service: ImagesService;
  let imagesRepository: ReturnType<typeof createMockImagesRepository>;
  let storageService: ReturnType<typeof createMockStorageService>;

  beforeEach(async () => {
    imagesRepository = createMockImagesRepository();
    storageService = createMockStorageService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        { provide: ImagesRepository, useValue: imagesRepository },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should upload file via storage service', async () => {
      
      const file = createMockFile();
      const user = createUserFactory();
      const createDto = { description: 'Test image' };
      const uploadResult = { filename: 'uuid.jpg', url: '/uploads/uuid.jpg' };
      const createdImage = createImageFactory({ user, userId: user.id });

      storageService.uploadImage.mockResolvedValue(uploadResult);
      imagesRepository.create.mockResolvedValue(createdImage);
      imagesRepository.findById.mockResolvedValue(createdImage);

      
      await service.create(file, createDto, user);

      
      expect(storageService.uploadImage).toHaveBeenCalledWith(file);
    });

    it('should create image with url from storage', async () => {
      
      const file = createMockFile();
      const user = createUserFactory();
      const createDto = { description: 'Test image' };
      const uploadResult = { filename: 'uuid.jpg', url: '/uploads/uuid.jpg' };
      const createdImage = createImageFactory({ url: uploadResult.url });

      storageService.uploadImage.mockResolvedValue(uploadResult);
      imagesRepository.create.mockResolvedValue(createdImage);
      imagesRepository.findById.mockResolvedValue(createdImage);

      
      await service.create(file, createDto, user);

      
      expect(imagesRepository.create).toHaveBeenCalledWith({
        url: uploadResult.url,
        description: createDto.description,
        userId: user.id,
      });
    });

    it('should process hashtags when provided', async () => {
      
      const file = createMockFile();
      const user = createUserFactory();
      const createDto = { description: 'Test', hashtags: ['nature', 'photo'] };
      const hashtags = [createHashtagFactory('nature'), createHashtagFactory('photo')];
      const createdImage = createImageFactory();

      storageService.uploadImage.mockResolvedValue({ filename: 'f.jpg', url: '/uploads/f.jpg' });
      imagesRepository.create.mockResolvedValue(createdImage);
      imagesRepository.findOrCreateHashtags.mockResolvedValue(hashtags);
      imagesRepository.findById.mockResolvedValue({ ...createdImage, hashtags });

      
      await service.create(file, createDto, user);

      
      expect(imagesRepository.findOrCreateHashtags).toHaveBeenCalledWith(['nature', 'photo']);
      expect(imagesRepository.updateImageHashtags).toHaveBeenCalledWith(createdImage.id, hashtags);
    });

    it('should process mentions when provided', async () => {
      
      const file = createMockFile();
      const user = createUserFactory();
      const mentionedUserId = 'mentioned-user-id';
      const createDto = { description: 'Test', mentionedUserIds: [mentionedUserId] };
      const createdImage = createImageFactory();

      storageService.uploadImage.mockResolvedValue({ filename: 'f.jpg', url: '/uploads/f.jpg' });
      imagesRepository.create.mockResolvedValue(createdImage);
      imagesRepository.findById.mockResolvedValue(createdImage);

      
      await service.create(file, createDto, user);

      
      expect(imagesRepository.updateImageMentions).toHaveBeenCalledWith(
        createdImage.id,
        [mentionedUserId],
      );
    });

    it('should return complete image with relations', async () => {
      
      const file = createMockFile();
      const user = createUserFactory();
      const createDto = { description: 'Test' };
      const createdImage = createImageFactory({ user });

      storageService.uploadImage.mockResolvedValue({ filename: 'f.jpg', url: '/uploads/f.jpg' });
      imagesRepository.create.mockResolvedValue(createdImage);
      imagesRepository.findById.mockResolvedValue(createdImage);

      
      const result = await service.create(file, createDto, user);

      
      expect(result).toEqual(createdImage);
      expect(imagesRepository.findById).toHaveBeenCalledWith(createdImage.id);
    });

    it('should not process hashtags when not provided', async () => {
      
      const file = createMockFile();
      const user = createUserFactory();
      const createDto = { description: 'Test' };
      const createdImage = createImageFactory();

      storageService.uploadImage.mockResolvedValue({ filename: 'f.jpg', url: '/uploads/f.jpg' });
      imagesRepository.create.mockResolvedValue(createdImage);
      imagesRepository.findById.mockResolvedValue(createdImage);

      
      await service.create(file, createDto, user);

      
      expect(imagesRepository.findOrCreateHashtags).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated images', async () => {
      
      const images = createManyImages(3);
      imagesRepository.findAll.mockResolvedValue([images, 10]);

      
      const result = await service.findAll(1, 3);

      
      expect(result).toEqual({ images, total: 10 });
      expect(imagesRepository.findAll).toHaveBeenCalledWith(1, 3);
    });

    it('should use default pagination values', async () => {
      
      imagesRepository.findAll.mockResolvedValue([[], 0]);

      
      await service.findAll();

      
      expect(imagesRepository.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findById', () => {
    it('should return image with all relations', async () => {
      
      const image = createImageFactory();
      imagesRepository.findById.mockResolvedValue(image);

      
      const result = await service.findById(image.id);

      
      expect(result).toEqual(image);
    });

    it('should throw NotFoundException when not found', async () => {
      
      const imageId = 'non-existent-id';
      imagesRepository.findById.mockResolvedValue(null);

      
      await expect(service.findById(imageId)).rejects.toThrow(NotFoundException);
      await expect(service.findById(imageId)).rejects.toThrow(
        `Image with ID "${imageId}" not found`,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return paginated user images', async () => {
      
      const user = createUserFactory();
      const images = createManyImages(2, user);
      imagesRepository.findByUserId.mockResolvedValue([images, 2]);

      
      const result = await service.findByUserId(user.id, 1, 10);

      
      expect(result).toEqual({ images, total: 2 });
      expect(imagesRepository.findByUserId).toHaveBeenCalledWith(user.id, 1, 10);
    });
  });

  describe('findByHashtag', () => {
    it('should return images with matching hashtag', async () => {
      
      const images = createManyImages(2);
      imagesRepository.findByHashtag.mockResolvedValue([images, 2]);

      
      const result = await service.findByHashtag('nature', 1, 10);

      
      expect(result).toEqual({ images, total: 2 });
      expect(imagesRepository.findByHashtag).toHaveBeenCalledWith('nature', 1, 10);
    });

    it('should support pagination', async () => {
      
      imagesRepository.findByHashtag.mockResolvedValue([[], 0]);

      
      await service.findByHashtag('test', 2, 5);

      
      expect(imagesRepository.findByHashtag).toHaveBeenCalledWith('test', 2, 5);
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException when user not owner', async () => {
      
      const owner = createUserFactory();
      const otherUser = createUserFactory();
      const image = createImageFactory({ user: owner, userId: owner.id });
      imagesRepository.findById.mockResolvedValue(image);

      
      await expect(
        service.update(image.id, { description: 'New' }, otherUser),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update(image.id, { description: 'New' }, otherUser),
      ).rejects.toThrow('You can only update your own images');
    });

    it('should allow owner to update', async () => {
      
      const owner = createUserFactory();
      const image = createImageFactory({ user: owner, userId: owner.id });
      const updatedImage = { ...image, description: 'Updated' };
      imagesRepository.findById
        .mockResolvedValueOnce(image)
        .mockResolvedValueOnce(updatedImage);

      
      const result = await service.update(image.id, { description: 'Updated' }, owner);

      
      expect(result.description).toBe('Updated');
    });

    it('should update description when provided', async () => {
      
      const owner = createUserFactory();
      const image = createImageFactory({ user: owner, userId: owner.id });
      imagesRepository.findById.mockResolvedValue(image);

      
      await service.update(image.id, { description: 'New description' }, owner);

      
      expect(imagesRepository.update).toHaveBeenCalledWith(image.id, {
        description: 'New description',
      });
    });

    it('should update hashtags when provided', async () => {
      
      const owner = createUserFactory();
      const image = createImageFactory({ user: owner, userId: owner.id });
      const newHashtags = [createHashtagFactory('new'), createHashtagFactory('tags')];
      imagesRepository.findById.mockResolvedValue(image);
      imagesRepository.findOrCreateHashtags.mockResolvedValue(newHashtags);

      
      await service.update(image.id, { hashtags: ['new', 'tags'] }, owner);

      
      expect(imagesRepository.findOrCreateHashtags).toHaveBeenCalledWith(['new', 'tags']);
      expect(imagesRepository.updateImageHashtags).toHaveBeenCalledWith(image.id, newHashtags);
    });

    it('should update mentions when provided', async () => {
      
      const owner = createUserFactory();
      const image = createImageFactory({ user: owner, userId: owner.id });
      const mentionIds = ['user-1', 'user-2'];
      imagesRepository.findById.mockResolvedValue(image);

      
      await service.update(image.id, { mentionedUserIds: mentionIds }, owner);

      
      expect(imagesRepository.updateImageMentions).toHaveBeenCalledWith(image.id, mentionIds);
    });

    it('should return updated image with relations', async () => {
      
      const owner = createUserFactory();
      const image = createImageFactory({ user: owner, userId: owner.id });
      const updatedImage = { ...image, description: 'Updated' };
      imagesRepository.findById
        .mockResolvedValueOnce(image)
        .mockResolvedValueOnce(updatedImage);

      
      const result = await service.update(image.id, { description: 'Updated' }, owner);

      
      expect(result).toEqual(updatedImage);
    });
  });

  describe('delete', () => {
    it('should throw ForbiddenException when user not owner', async () => {
      
      const owner = createUserFactory();
      const otherUser = createUserFactory();
      const image = createImageFactory({ user: owner, userId: owner.id });
      imagesRepository.findById.mockResolvedValue(image);

      
      await expect(service.delete(image.id, otherUser)).rejects.toThrow(ForbiddenException);
      await expect(service.delete(image.id, otherUser)).rejects.toThrow(
        'You can only delete your own images',
      );
    });

    it('should delete file from storage', async () => {
      
      const owner = createUserFactory();
      const image = createImageFactory({ user: owner, userId: owner.id });
      imagesRepository.findById.mockResolvedValue(image);
      imagesRepository.getImageFilename.mockResolvedValue('image-file.jpg');
      imagesRepository.delete.mockResolvedValue(true);

      
      await service.delete(image.id, owner);

      
      expect(storageService.deleteImage).toHaveBeenCalledWith('image-file.jpg');
    });

    it('should delete image from database', async () => {
      
      const owner = createUserFactory();
      const image = createImageFactory({ user: owner, userId: owner.id });
      imagesRepository.findById.mockResolvedValue(image);
      imagesRepository.getImageFilename.mockResolvedValue('file.jpg');
      imagesRepository.delete.mockResolvedValue(true);

      
      await service.delete(image.id, owner);

      
      expect(imagesRepository.delete).toHaveBeenCalledWith(image.id);
    });

    it('should handle missing file gracefully', async () => {
      
      const owner = createUserFactory();
      const image = createImageFactory({ user: owner, userId: owner.id });
      imagesRepository.findById.mockResolvedValue(image);
      imagesRepository.getImageFilename.mockResolvedValue(null);
      imagesRepository.delete.mockResolvedValue(true);

      
      await expect(service.delete(image.id, owner)).resolves.not.toThrow();
      expect(storageService.deleteImage).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if delete fails', async () => {
      
      const owner = createUserFactory();
      const image = createImageFactory({ user: owner, userId: owner.id });
      imagesRepository.findById.mockResolvedValue(image);
      imagesRepository.getImageFilename.mockResolvedValue('file.jpg');
      imagesRepository.delete.mockResolvedValue(false);

      
      await expect(service.delete(image.id, owner)).rejects.toThrow(NotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from '../images.controller';
import { ImagesService } from '../images.service';
import { createUserFactory } from '../../../../test/factories/user.factory';
import {
  createImageFactory,
  createMockFile,
  createManyImages,
} from '../../../../test/factories/image.factory';
import { createMockImagesService } from '../../../../test/mocks/services.mock';

describe('ImagesController', () => {
  let controller: ImagesController;
  let imagesService: ReturnType<typeof createMockImagesService>;

  beforeEach(async () => {
    imagesService = createMockImagesService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [{ provide: ImagesService, useValue: imagesService }],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
    jest.clearAllMocks();
  });

  describe('POST /images', () => {
    it('should create image with metadata', async () => {
      
      const user = createUserFactory();
      const file = createMockFile();
      const createDto = { description: 'Test image', hashtags: ['test'] };
      const createdImage = createImageFactory({ user });
      imagesService.create.mockResolvedValue(createdImage);

      
      const result = await controller.create(file, createDto, user);

      
      expect(result).toHaveProperty('id');
      expect(imagesService.create).toHaveBeenCalledWith(file, createDto, user);
    });

    it('should pass file to service', async () => {
      
      const user = createUserFactory();
      const file = createMockFile({ originalname: 'specific-file.jpg' });
      const createDto = { description: 'Test' };
      imagesService.create.mockResolvedValue(createImageFactory());

      
      await controller.create(file, createDto, user);

      
      expect(imagesService.create).toHaveBeenCalledWith(
        expect.objectContaining({ originalname: 'specific-file.jpg' }),
        createDto,
        user,
      );
    });

    it('should pass hashtags to service', async () => {
      
      const user = createUserFactory();
      const file = createMockFile();
      const createDto = { description: 'Test', hashtags: ['nature', 'photo'] };
      imagesService.create.mockResolvedValue(createImageFactory());

      
      await controller.create(file, createDto, user);

      
      expect(imagesService.create).toHaveBeenCalledWith(
        file,
        expect.objectContaining({ hashtags: ['nature', 'photo'] }),
        user,
      );
    });

    it('should pass mentionedUserIds to service', async () => {
      
      const user = createUserFactory();
      const file = createMockFile();
      const createDto = {
        description: 'Test',
        mentionedUserIds: ['user-id-1', 'user-id-2'],
      };
      imagesService.create.mockResolvedValue(createImageFactory());

      
      await controller.create(file, createDto, user);

      
      expect(imagesService.create).toHaveBeenCalledWith(
        file,
        expect.objectContaining({
          mentionedUserIds: ['user-id-1', 'user-id-2'],
        }),
        user,
      );
    });
  });

  describe('GET /images', () => {
    it('should return paginated images', async () => {
      
      const images = createManyImages(5);
      imagesService.findAll.mockResolvedValue({ images, total: 20 });

      
      const result = await controller.findAll(1, 5);

      
      expect(result.data).toHaveLength(5);
      expect(result.meta).toEqual({
        total: 20,
        page: 1,
        limit: 5,
        totalPages: 4,
      });
    });

    it('should use default pagination values', async () => {
      
      imagesService.findAll.mockResolvedValue({ images: [], total: 0 });

      
      await controller.findAll();

      
      expect(imagesService.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should transform images to ImageResponseDto', async () => {
      
      const images = createManyImages(1);
      imagesService.findAll.mockResolvedValue({ images, total: 1 });

      
      const result = await controller.findAll(1, 10);

      
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('url');
    });
  });

  describe('GET /images/hashtag/:hashtag', () => {
    it('should filter images by hashtag', async () => {
      
      const images = createManyImages(3);
      imagesService.findByHashtag.mockResolvedValue({ images, total: 3 });

      
      const result = await controller.findByHashtag('nature', 1, 10);

      
      expect(result.data).toHaveLength(3);
      expect(imagesService.findByHashtag).toHaveBeenCalledWith('nature', 1, 10);
    });

    it('should return paginated results with meta', async () => {
      
      const images = createManyImages(5);
      imagesService.findByHashtag.mockResolvedValue({ images, total: 15 });

      
      const result = await controller.findByHashtag('photo', 1, 5);

      
      expect(result.meta).toEqual({
        total: 15,
        page: 1,
        limit: 5,
        totalPages: 3,
      });
    });

    it('should return empty for non-existent hashtag', async () => {
      
      imagesService.findByHashtag.mockResolvedValue({ images: [], total: 0 });

      
      const result = await controller.findByHashtag('nonexistent', 1, 10);

      
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('GET /images/:id', () => {
    it('should return image with all relations', async () => {
      
      const image = createImageFactory();
      imagesService.findById.mockResolvedValue(image);

      
      const result = await controller.findOne(image.id);

      
      expect(result).toHaveProperty('id', image.id);
      expect(imagesService.findById).toHaveBeenCalledWith(image.id);
    });

    it('should transform to ImageResponseDto', async () => {
      
      const image = createImageFactory();
      imagesService.findById.mockResolvedValue(image);

      
      const result = await controller.findOne(image.id);

      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('url');
    });
  });

  describe('PATCH /images/:id', () => {
    it('should update image and return result', async () => {
      
      const user = createUserFactory();
      const image = createImageFactory({ user, userId: user.id });
      const updateDto = { description: 'Updated description' };
      const updatedImage = { ...image, description: 'Updated description' };
      imagesService.update.mockResolvedValue(updatedImage);

      
      const result = await controller.update(image.id, updateDto, user);

      
      expect(result).toHaveProperty('description', 'Updated description');
      expect(imagesService.update).toHaveBeenCalledWith(image.id, updateDto, user);
    });

    it('should pass user to service for ownership check', async () => {
      
      const user = createUserFactory({ id: 'specific-user-id' });
      const image = createImageFactory();
      imagesService.update.mockResolvedValue(image);

      
      await controller.update(image.id, {}, user);

      
      expect(imagesService.update).toHaveBeenCalledWith(
        image.id,
        {},
        expect.objectContaining({ id: 'specific-user-id' }),
      );
    });

    it('should update hashtags when provided', async () => {
      
      const user = createUserFactory();
      const image = createImageFactory({ user });
      const updateDto = { hashtags: ['new', 'tags'] };
      imagesService.update.mockResolvedValue(image);

      
      await controller.update(image.id, updateDto, user);

      
      expect(imagesService.update).toHaveBeenCalledWith(
        image.id,
        expect.objectContaining({ hashtags: ['new', 'tags'] }),
        user,
      );
    });
  });

  describe('DELETE /images/:id', () => {
    it('should delete image', async () => {
      
      const user = createUserFactory();
      const imageId = 'image-to-delete-id';
      imagesService.delete.mockResolvedValue(undefined);

      
      await controller.delete(imageId, user);

      
      expect(imagesService.delete).toHaveBeenCalledWith(imageId, user);
    });

    it('should pass user to service for ownership check', async () => {
      
      const user = createUserFactory({ id: 'deleting-user-id' });
      imagesService.delete.mockResolvedValue(undefined);

      
      await controller.delete('image-id', user);

      
      expect(imagesService.delete).toHaveBeenCalledWith(
        'image-id',
        expect.objectContaining({ id: 'deleting-user-id' }),
      );
    });

    it('should return nothing on success', async () => {
      
      const user = createUserFactory();
      imagesService.delete.mockResolvedValue(undefined);

      
      const result = await controller.delete('image-id', user);

      
      expect(result).toBeUndefined();
    });
  });
});

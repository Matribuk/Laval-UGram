import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsService } from '../comments.service';
import { CommentsRepository } from '../comments.repository';
import { ImagesService } from '../../images/images.service';
import { AnalyticsService } from '../../monitoring/analytics.service';
import {
  createMockCommentsRepository,
  createMockImagesService,
  createMockNotificationsService,
  createMockAnalyticsService,
} from '../../../../test/mocks/services.mock';
import { createCommentFactory, createImageFactory } from '../../../../test/factories';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentsRepository: ReturnType<typeof createMockCommentsRepository>;
  let imagesService: ReturnType<typeof createMockImagesService>;
  let notificationsService: ReturnType<typeof createMockNotificationsService>;
  let analytics: ReturnType<typeof createMockAnalyticsService>;

  beforeEach(async () => {
    commentsRepository = createMockCommentsRepository();
    imagesService = createMockImagesService();
    notificationsService = createMockNotificationsService();
    analytics = createMockAnalyticsService();
    notificationsService.createNotification.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: CommentsRepository, useValue: commentsRepository },
        { provide: ImagesService, useValue: imagesService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AnalyticsService, useValue: analytics },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    jest.clearAllMocks();
  });

  describe('addComment', () => {
    it('should add a comment and return it', async () => {
      const comment = createCommentFactory({ content: 'Nice photo!' });
      imagesService.findById.mockResolvedValue(createImageFactory());
      commentsRepository.create.mockResolvedValue(comment);

      const result = await service.addComment('user-id', 'image-id', 'Nice photo!');

      expect(imagesService.findById).toHaveBeenCalledWith('image-id');
      expect(commentsRepository.create).toHaveBeenCalledWith('user-id', 'image-id', 'Nice photo!');
      expect(result).toEqual(comment);
    });

    it('should trigger a notification for the image owner', async () => {
      const image = createImageFactory({ userId: 'owner-id' });
      const comment = createCommentFactory({ id: 'comment-id', content: 'Nice!' });
      imagesService.findById.mockResolvedValue(image);
      commentsRepository.create.mockResolvedValue(comment);

      await service.addComment('user-id', 'image-id', 'Nice!');

      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        'owner-id',
        'user-id',
        NotificationType.COMMENT,
        'comment-id',
      );
    });

    it('should throw NotFoundException if image does not exist', async () => {
      imagesService.findById.mockRejectedValue(new NotFoundException('Image not found'));

      await expect(service.addComment('user-id', 'deleted-image-id', 'Hi')).rejects.toThrow(
        NotFoundException,
      );
      expect(commentsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('removeComment', () => {
    it('should remove the comment when user is the owner', async () => {
      const comment = createCommentFactory({ userId: 'user-id' });
      commentsRepository.findById.mockResolvedValue(comment);
      commentsRepository.delete.mockResolvedValue(undefined);

      await service.removeComment('user-id', comment.id);

      expect(commentsRepository.findById).toHaveBeenCalledWith(comment.id);
      expect(commentsRepository.delete).toHaveBeenCalledWith(comment.id);
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      commentsRepository.findById.mockResolvedValue(null);

      await expect(service.removeComment('user-id', 'non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(commentsRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const comment = createCommentFactory({ userId: 'other-user-id' });
      commentsRepository.findById.mockResolvedValue(comment);

      await expect(service.removeComment('user-id', comment.id)).rejects.toThrow(
        ForbiddenException,
      );
      expect(commentsRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getCommentsByImage', () => {
    it('should return paginated comments for an image', async () => {
      const comments = [createCommentFactory(), createCommentFactory()];
      commentsRepository.findByImageId.mockResolvedValue([comments, 2]);

      const result = await service.getCommentsByImage('image-id', 1, 10);

      expect(commentsRepository.findByImageId).toHaveBeenCalledWith('image-id', 1, 10);
      expect(result).toEqual({ comments, total: 2 });
    });

    it('should return empty list when image has no comments', async () => {
      commentsRepository.findByImageId.mockResolvedValue([[], 0]);

      const result = await service.getCommentsByImage('image-id', 1, 10);

      expect(result).toEqual({ comments: [], total: 0 });
    });
  });

  describe('getCommentsByUser', () => {
    it('should return paginated comments made by a user', async () => {
      const comments = [createCommentFactory(), createCommentFactory()];
      commentsRepository.findByUserId.mockResolvedValue([comments, 2]);

      const result = await service.getCommentsByUser('user-id', 1, 10);

      expect(commentsRepository.findByUserId).toHaveBeenCalledWith('user-id', 1, 10);
      expect(result).toEqual({ comments, total: 2 });
    });

    it('should return empty list when user has no comments', async () => {
      commentsRepository.findByUserId.mockResolvedValue([[], 0]);

      const result = await service.getCommentsByUser('user-id', 1, 10);

      expect(result).toEqual({ comments: [], total: 0 });
    });
  });
});

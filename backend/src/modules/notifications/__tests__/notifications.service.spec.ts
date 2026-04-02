import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationsService } from '../notifications.service';
import { NotificationsRepository } from '../notifications.repository';
import { NotificationType } from '../entities/notification.entity';
import { createMockNotificationsRepository } from '../../../../test/mocks/services.mock';
import { createNotificationFactory } from '../../../../test/factories';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationsRepository: ReturnType<typeof createMockNotificationsRepository>;

  beforeEach(async () => {
    notificationsRepository = createMockNotificationsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationsRepository, useValue: notificationsRepository },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create and return a notification', async () => {
      const notification = createNotificationFactory({ type: NotificationType.LIKE });
      notificationsRepository.create.mockResolvedValue(notification);

      const result = await service.createNotification('user-id', 'actor-id', NotificationType.LIKE, 'ref-id');

      expect(notificationsRepository.create).toHaveBeenCalledWith('user-id', 'actor-id', NotificationType.LIKE, 'ref-id');
      expect(result).toEqual(notification);
    });

    it('should return null and skip creation when actor is the receiver', async () => {
      const result = await service.createNotification('same-id', 'same-id', NotificationType.LIKE, 'ref-id');

      expect(result).toBeNull();
      expect(notificationsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getNotifications', () => {
    it('should return paginated notifications for a user', async () => {
      const notifications = [createNotificationFactory(), createNotificationFactory()];
      notificationsRepository.findByUserId.mockResolvedValue([notifications, 2]);

      const result = await service.getNotifications('user-id', 1, 20);

      expect(notificationsRepository.findByUserId).toHaveBeenCalledWith('user-id', 1, 20);
      expect(result).toEqual({ notifications, total: 2 });
    });

    it('should return empty list when user has no notifications', async () => {
      notificationsRepository.findByUserId.mockResolvedValue([[], 0]);

      const result = await service.getNotifications('user-id', 1, 20);

      expect(result).toEqual({ notifications: [], total: 0 });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read and return it', async () => {
      const notification = createNotificationFactory({ userId: 'user-id', read: false });
      notificationsRepository.findById.mockResolvedValue(notification);
      notificationsRepository.markAsRead.mockResolvedValue(undefined);

      const result = await service.markAsRead('user-id', notification.id);

      expect(notificationsRepository.markAsRead).toHaveBeenCalledWith(notification.id);
      expect(result.read).toBe(true);
    });

    it('should throw NotFoundException when notification does not exist', async () => {
      notificationsRepository.findById.mockResolvedValue(null);

      await expect(service.markAsRead('user-id', 'non-existent-id')).rejects.toThrow(NotFoundException);
      expect(notificationsRepository.markAsRead).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not own the notification', async () => {
      const notification = createNotificationFactory({ userId: 'other-user-id' });
      notificationsRepository.findById.mockResolvedValue(notification);

      await expect(service.markAsRead('user-id', notification.id)).rejects.toThrow(ForbiddenException);
      expect(notificationsRepository.markAsRead).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should call repository markAllAsRead with the user id', async () => {
      notificationsRepository.markAllAsRead.mockResolvedValue(undefined);

      await service.markAllAsRead('user-id');

      expect(notificationsRepository.markAllAsRead).toHaveBeenCalledWith('user-id');
    });
  });
});

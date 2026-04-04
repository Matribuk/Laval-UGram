import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationsController } from '../notifications.controller';
import { NotificationsService } from '../notifications.service';
import { createMockNotificationsService } from '../../../../test/mocks/services.mock';
import { createUserFactory, createNotificationFactory, createManyNotifications } from '../../../../test/factories';
import { NotificationType } from '../entities/notification.entity';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: ReturnType<typeof createMockNotificationsService>;

  const user = createUserFactory();

  beforeEach(async () => {
    notificationsService = createMockNotificationsService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: notificationsService }],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    jest.clearAllMocks();
  });

  describe('GET /notifications', () => {
    it('should return paginated notifications for the current user', async () => {
      const notifications = createManyNotifications(3, user.id);
      notificationsService.getNotifications.mockResolvedValue({ notifications, total: 3 });

      const result = await controller.getNotifications(user, 1, 20);

      expect(notificationsService.getNotifications).toHaveBeenCalledWith(user.id, 1, 20);
      expect(result.data).toHaveLength(3);
      expect(result.meta.total).toBe(3);
    });

    it('should return empty list when user has no notifications', async () => {
      notificationsService.getNotifications.mockResolvedValue({ notifications: [], total: 0 });

      const result = await controller.getNotifications(user, 1, 20);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should calculate totalPages correctly', async () => {
      notificationsService.getNotifications.mockResolvedValue({ notifications: [], total: 50 });

      const result = await controller.getNotifications(user, 1, 20);

      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('PATCH /notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      notificationsService.markAllAsRead.mockResolvedValue(undefined);

      await controller.markAllAsRead(user);

      expect(notificationsService.markAllAsRead).toHaveBeenCalledWith(user.id);
    });
  });

  describe('PATCH /notifications/:id/read', () => {
    it('should mark a notification as read and return it', async () => {
      const notification = createNotificationFactory({ userId: user.id, type: NotificationType.LIKE, read: true });
      notificationsService.markAsRead.mockResolvedValue(notification);

      const result = await controller.markAsRead(notification.id, user);

      expect(notificationsService.markAsRead).toHaveBeenCalledWith(user.id, notification.id);
      expect(result.read).toBe(true);
    });

    it('should throw NotFoundException when notification does not exist', async () => {
      notificationsService.markAsRead.mockRejectedValue(new NotFoundException());

      await expect(controller.markAsRead('bad-id', user)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own the notification', async () => {
      notificationsService.markAsRead.mockRejectedValue(new ForbiddenException());

      await expect(controller.markAsRead('other-notif-id', user)).rejects.toThrow(ForbiddenException);
    });
  });
});

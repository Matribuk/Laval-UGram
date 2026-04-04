import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async createNotification(
    userId: string,
    actorId: string,
    type: NotificationType,
    referenceId: string,
  ): Promise<Notification | null> {
    if (userId === actorId) {
      return null;
    }
    return this.notificationsRepository.create(userId, actorId, type, referenceId);
  }

  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await this.notificationsRepository.findByUserId(userId, page, limit);
    return { notifications, total };
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('You can only mark your own notifications as read');
    }
    await this.notificationsRepository.markAsRead(notificationId);
    notification.read = true;
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.markAllAsRead(userId);
  }
}

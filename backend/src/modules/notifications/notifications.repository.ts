import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    actorId: string,
    type: NotificationType,
    referenceId: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({ userId, actorId, type, referenceId });
    const saved = await this.notificationRepository.save(notification);
    return this.findById(saved.id) as Promise<Notification>;
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notificationRepository.findOne({
      where: { id },
      relations: ['actor'],
    });
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Notification[], number]> {
    return this.notificationRepository.findAndCount({
      where: { userId },
      relations: ['actor'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.update({ id: notificationId }, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update({ userId, read: false }, { read: true });
  }
}

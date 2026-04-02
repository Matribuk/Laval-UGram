import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsRepository } from '../notifications.repository';
import { Notification, NotificationType } from '../entities/notification.entity';
import { createNotificationFactory } from '../../../../test/factories';

const mockTypeOrmRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
});

describe('NotificationsRepository', () => {
  let repository: NotificationsRepository;
  let notificationRepo: jest.Mocked<Repository<Notification>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsRepository,
        { provide: getRepositoryToken(Notification), useFactory: mockTypeOrmRepository },
      ],
    }).compile();

    repository = module.get<NotificationsRepository>(NotificationsRepository);
    notificationRepo = module.get(getRepositoryToken(Notification));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create, save and return notification with actor relation', async () => {
      const notification = createNotificationFactory();
      notificationRepo.create.mockReturnValue(notification);
      notificationRepo.save.mockResolvedValue(notification);
      notificationRepo.findOne.mockResolvedValue(notification);

      const result = await repository.create('user-id', 'actor-id', NotificationType.LIKE, 'ref-id');

      expect(notificationRepo.create).toHaveBeenCalledWith({
        userId: 'user-id',
        actorId: 'actor-id',
        type: NotificationType.LIKE,
        referenceId: 'ref-id',
      });
      expect(result).toEqual(notification);
    });
  });

  describe('findById', () => {
    it('should return a notification with actor relation', async () => {
      const notification = createNotificationFactory();
      notificationRepo.findOne.mockResolvedValue(notification);

      const result = await repository.findById(notification.id);

      expect(notificationRepo.findOne).toHaveBeenCalledWith({
        where: { id: notification.id },
        relations: ['actor'],
      });
      expect(result).toEqual(notification);
    });

    it('should return null when notification does not exist', async () => {
      notificationRepo.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return paginated notifications for a user', async () => {
      const notifications = [createNotificationFactory(), createNotificationFactory()];
      notificationRepo.findAndCount.mockResolvedValue([notifications, 2]);

      const [result, total] = await repository.findByUserId('user-id', 1, 20);

      expect(notificationRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-id' }, skip: 0, take: 20 }),
      );
      expect(result).toEqual(notifications);
      expect(total).toBe(2);
    });

    it('should apply correct pagination offset', async () => {
      notificationRepo.findAndCount.mockResolvedValue([[], 0]);

      await repository.findByUserId('user-id', 3, 10);

      expect(notificationRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should update the notification read status to true', async () => {
      notificationRepo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      await repository.markAsRead('notification-id');

      expect(notificationRepo.update).toHaveBeenCalledWith(
        { id: 'notification-id' },
        { read: true },
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications for a user', async () => {
      notificationRepo.update.mockResolvedValue({ affected: 5, raw: {}, generatedMaps: [] });

      await repository.markAllAsRead('user-id');

      expect(notificationRepo.update).toHaveBeenCalledWith(
        { userId: 'user-id', read: false },
        { read: true },
      );
    });
  });
});

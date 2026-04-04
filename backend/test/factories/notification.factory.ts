import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationType } from '../../src/modules/notifications/entities/notification.entity';
import { createUserFactory } from './user.factory';

export const createNotificationFactory = (overrides: Partial<Notification> = {}): Notification => {
  const actor = overrides.actor ?? createUserFactory();
  const user = overrides.user ?? createUserFactory();

  const notification = new Notification();
  notification.id = overrides.id ?? uuidv4();
  notification.type = overrides.type ?? NotificationType.LIKE;
  notification.referenceId = overrides.referenceId ?? uuidv4();
  notification.read = overrides.read ?? false;
  notification.userId = overrides.userId ?? user.id;
  notification.user = user;
  notification.actorId = overrides.actorId ?? actor.id;
  notification.actor = actor;
  notification.createdAt = overrides.createdAt ?? new Date();

  return notification;
};

export const createManyNotifications = (count: number, userId?: string): Notification[] =>
  Array.from({ length: count }, () => createNotificationFactory({ userId }));

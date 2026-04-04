import { v4 as uuidv4 } from 'uuid';
import { Message } from '../../src/modules/messages/entities/message.entity';
import { createUserFactory } from './user.factory';

export const createMessageFactory = (overrides: Partial<Message> = {}): Message => {
  const sender = overrides.sender ?? createUserFactory();
  const receiver = overrides.receiver ?? createUserFactory();

  const message = new Message();
  message.id = overrides.id ?? uuidv4();
  message.content = overrides.content ?? 'Hello!';
  message.read = overrides.read ?? false;
  message.senderId = overrides.senderId ?? sender.id;
  message.sender = sender;
  message.receiverId = overrides.receiverId ?? receiver.id;
  message.receiver = receiver;
  message.createdAt = overrides.createdAt ?? new Date();

  return message;
};

export const createManyMessages = (count: number, overrides: Partial<Message> = {}): Message[] =>
  Array.from({ length: count }, () => createMessageFactory(overrides));

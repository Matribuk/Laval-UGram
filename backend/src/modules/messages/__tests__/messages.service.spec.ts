import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessagesService } from '../messages.service';
import { MessagesRepository } from '../messages.repository';
import { UsersService } from '../../users/users.service';
import {
  createMockMessagesRepository,
  createMockUsersService,
} from '../../../../test/mocks/services.mock';
import { createMessageFactory, createUserFactory } from '../../../../test/factories';

describe('MessagesService', () => {
  let service: MessagesService;
  let messagesRepository: ReturnType<typeof createMockMessagesRepository>;
  let usersService: ReturnType<typeof createMockUsersService>;

  const sender = createUserFactory({ id: 'sender-id' });
  const receiver = createUserFactory({ id: 'receiver-id' });

  beforeEach(async () => {
    messagesRepository = createMockMessagesRepository();
    usersService = createMockUsersService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: MessagesRepository, useValue: messagesRepository },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send a message and return it', async () => {
      const message = createMessageFactory({ sender, receiver, senderId: sender.id, receiverId: receiver.id });
      usersService.findById.mockResolvedValue(receiver);
      messagesRepository.create.mockResolvedValue(message);

      const result = await service.sendMessage(sender.id, receiver.id, 'Hello!');

      expect(usersService.findById).toHaveBeenCalledWith(receiver.id);
      expect(messagesRepository.create).toHaveBeenCalledWith(sender.id, receiver.id, 'Hello!');
      expect(result).toEqual(message);
    });

    it('should throw BadRequestException when sender equals receiver', async () => {
      await expect(service.sendMessage('user-id', 'user-id', 'Hi')).rejects.toThrow(
        BadRequestException,
      );
      expect(usersService.findById).not.toHaveBeenCalled();
      expect(messagesRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when receiver does not exist', async () => {
      usersService.findById.mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.sendMessage(sender.id, 'unknown-id', 'Hi')).rejects.toThrow(
        NotFoundException,
      );
      expect(messagesRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getMessages', () => {
    it('should return paginated messages between two users', async () => {
      const messages = [createMessageFactory(), createMessageFactory()];
      messagesRepository.findMessagesBetweenUsers.mockResolvedValue([messages, 2]);

      const result = await service.getMessages(sender.id, receiver.id, 1, 20);

      expect(messagesRepository.findMessagesBetweenUsers).toHaveBeenCalledWith(
        sender.id, receiver.id, 1, 20,
      );
      expect(result).toEqual({ messages, total: 2 });
    });

    it('should return empty list when no messages exist', async () => {
      messagesRepository.findMessagesBetweenUsers.mockResolvedValue([[], 0]);

      const result = await service.getMessages(sender.id, receiver.id, 1, 20);

      expect(result).toEqual({ messages: [], total: 0 });
    });
  });

  describe('getConversations', () => {
    it('should return conversation list grouped by partner', async () => {
      const partner = createUserFactory({ id: 'partner-id' });
      const msg1 = createMessageFactory({ senderId: sender.id, sender, receiverId: partner.id, receiver: partner });
      const msg2 = createMessageFactory({ senderId: partner.id, sender: partner, receiverId: sender.id, receiver: sender, read: false });
      messagesRepository.findAllInvolving.mockResolvedValue([msg1, msg2]);

      const result = await service.getConversations(sender.id);

      expect(result).toHaveLength(1);
      expect(result[0].otherUser.id).toBe(partner.id);
      expect(result[0].lastMessage).toEqual(msg1);
    });

    it('should count unread messages per conversation partner', async () => {
      const partner = createUserFactory({ id: 'partner-id' });
      const unread1 = createMessageFactory({ senderId: partner.id, sender: partner, receiverId: sender.id, receiver: sender, read: false });
      const unread2 = createMessageFactory({ senderId: partner.id, sender: partner, receiverId: sender.id, receiver: sender, read: false });
      messagesRepository.findAllInvolving.mockResolvedValue([unread1, unread2]);

      const result = await service.getConversations(sender.id);

      expect(result[0].unreadCount).toBe(2);
    });

    it('should return empty list when user has no messages', async () => {
      messagesRepository.findAllInvolving.mockResolvedValue([]);

      const result = await service.getConversations(sender.id);

      expect(result).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('should mark the message as read and return it', async () => {
      const message = createMessageFactory({ receiverId: sender.id, receiver: sender, read: false });
      messagesRepository.findById.mockResolvedValue(message);
      messagesRepository.markAsRead.mockResolvedValue(undefined);

      const result = await service.markAsRead(sender.id, message.id);

      expect(messagesRepository.markAsRead).toHaveBeenCalledWith(message.id);
      expect(result.read).toBe(true);
    });

    it('should throw NotFoundException when message does not exist', async () => {
      messagesRepository.findById.mockResolvedValue(null);

      await expect(service.markAsRead(sender.id, 'bad-id')).rejects.toThrow(NotFoundException);
      expect(messagesRepository.markAsRead).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not the receiver', async () => {
      const message = createMessageFactory({ receiverId: 'other-user-id' });
      messagesRepository.findById.mockResolvedValue(message);

      await expect(service.markAsRead(sender.id, message.id)).rejects.toThrow(ForbiddenException);
      expect(messagesRepository.markAsRead).not.toHaveBeenCalled();
    });
  });
});

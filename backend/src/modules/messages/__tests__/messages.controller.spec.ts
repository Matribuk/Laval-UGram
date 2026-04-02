import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MessagesController } from '../messages.controller';
import { MessagesService } from '../messages.service';
import { createMockMessagesService } from '../../../../test/mocks/services.mock';
import { createUserFactory, createMessageFactory, createManyMessages } from '../../../../test/factories';
import { CreateMessageDto } from '../dto';

describe('MessagesController', () => {
  let controller: MessagesController;
  let messagesService: ReturnType<typeof createMockMessagesService>;

  const sender = createUserFactory({ id: 'sender-id' });
  const receiver = createUserFactory({ id: 'receiver-id' });

  beforeEach(async () => {
    messagesService = createMockMessagesService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [{ provide: MessagesService, useValue: messagesService }],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    jest.clearAllMocks();
  });

  describe('POST /messages', () => {
    it('should send a message and return the response DTO', async () => {
      const message = createMessageFactory({ sender, receiver, senderId: sender.id, receiverId: receiver.id });
      messagesService.sendMessage.mockResolvedValue(message);
      const dto: CreateMessageDto = { receiverId: receiver.id, content: 'Hello!' };

      const result = await controller.sendMessage(dto, sender);

      expect(messagesService.sendMessage).toHaveBeenCalledWith(sender.id, receiver.id, 'Hello!');
      expect(result.content).toBe('Hello!');
    });

    it('should throw BadRequestException when sending to self', async () => {
      messagesService.sendMessage.mockRejectedValue(new BadRequestException());
      const dto: CreateMessageDto = { receiverId: sender.id, content: 'Hi' };

      await expect(controller.sendMessage(dto, sender)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when receiver does not exist', async () => {
      messagesService.sendMessage.mockRejectedValue(new NotFoundException());
      const dto: CreateMessageDto = { receiverId: 'bad-id', content: 'Hi' };

      await expect(controller.sendMessage(dto, sender)).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /messages/conversations', () => {
    it('should return the list of conversations', async () => {
      const message = createMessageFactory({ sender, receiver });
      messagesService.getConversations.mockResolvedValue([
        { otherUser: receiver, lastMessage: message, unreadCount: 2 },
      ]);

      const result = await controller.getConversations(sender);

      expect(messagesService.getConversations).toHaveBeenCalledWith(sender.id);
      expect(result).toHaveLength(1);
      expect(result[0].unreadCount).toBe(2);
    });

    it('should return empty list when no conversations exist', async () => {
      messagesService.getConversations.mockResolvedValue([]);

      const result = await controller.getConversations(sender);

      expect(result).toEqual([]);
    });
  });

  describe('GET /messages/:userId', () => {
    it('should return paginated messages with another user', async () => {
      const messages = createManyMessages(3);
      messagesService.getMessages.mockResolvedValue({ messages, total: 3 });

      const result = await controller.getMessages(receiver.id, sender, 1, 20);

      expect(messagesService.getMessages).toHaveBeenCalledWith(sender.id, receiver.id, 1, 20);
      expect(result.data).toHaveLength(3);
      expect(result.meta.total).toBe(3);
    });

    it('should calculate totalPages correctly', async () => {
      messagesService.getMessages.mockResolvedValue({ messages: [], total: 45 });

      const result = await controller.getMessages(receiver.id, sender, 1, 20);

      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('PATCH /messages/:id/read', () => {
    it('should mark a message as read and return it', async () => {
      const message = createMessageFactory({ receiver: sender, receiverId: sender.id, read: true });
      messagesService.markAsRead.mockResolvedValue(message);

      const result = await controller.markAsRead(message.id, sender);

      expect(messagesService.markAsRead).toHaveBeenCalledWith(sender.id, message.id);
      expect(result.read).toBe(true);
    });

    it('should throw NotFoundException when message does not exist', async () => {
      messagesService.markAsRead.mockRejectedValue(new NotFoundException());

      await expect(controller.markAsRead('bad-id', sender)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the receiver', async () => {
      messagesService.markAsRead.mockRejectedValue(new ForbiddenException());

      await expect(controller.markAsRead('msg-id', sender)).rejects.toThrow(ForbiddenException);
    });
  });
});

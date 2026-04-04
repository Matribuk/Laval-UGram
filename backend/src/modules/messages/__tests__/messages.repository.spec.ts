import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagesRepository } from '../messages.repository';
import { Message } from '../entities/message.entity';
import { createMessageFactory } from '../../../../test/factories';

const mockTypeOrmRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
});

describe('MessagesRepository', () => {
  let repository: MessagesRepository;
  let messageRepo: jest.Mocked<Repository<Message>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesRepository,
        { provide: getRepositoryToken(Message), useFactory: mockTypeOrmRepository },
      ],
    }).compile();

    repository = module.get<MessagesRepository>(MessagesRepository);
    messageRepo = module.get(getRepositoryToken(Message));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create, save and return the message with user relations', async () => {
      const message = createMessageFactory();
      messageRepo.create.mockReturnValue(message);
      messageRepo.save.mockResolvedValue(message);
      messageRepo.findOne.mockResolvedValue(message);

      const result = await repository.create('sender-id', 'receiver-id', 'Hello!');

      expect(messageRepo.create).toHaveBeenCalledWith({
        senderId: 'sender-id',
        receiverId: 'receiver-id',
        content: 'Hello!',
      });
      expect(result).toEqual(message);
    });
  });

  describe('findById', () => {
    it('should return a message by id with user relations', async () => {
      const message = createMessageFactory();
      messageRepo.findOne.mockResolvedValue(message);

      const result = await repository.findById(message.id);

      expect(messageRepo.findOne).toHaveBeenCalledWith({
        where: { id: message.id },
        relations: ['sender', 'receiver'],
      });
      expect(result).toEqual(message);
    });

    it('should return null when message does not exist', async () => {
      messageRepo.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findMessagesBetweenUsers', () => {
    it('should return paginated messages between two users', async () => {
      const messages = [createMessageFactory(), createMessageFactory()];
      messageRepo.findAndCount.mockResolvedValue([messages, 2]);

      const [result, total] = await repository.findMessagesBetweenUsers('user-a', 'user-b', 1, 20);

      expect(messageRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [
            { senderId: 'user-a', receiverId: 'user-b' },
            { senderId: 'user-b', receiverId: 'user-a' },
          ],
          skip: 0,
          take: 20,
        }),
      );
      expect(result).toEqual(messages);
      expect(total).toBe(2);
    });

    it('should apply correct pagination offset', async () => {
      messageRepo.findAndCount.mockResolvedValue([[], 0]);

      await repository.findMessagesBetweenUsers('user-a', 'user-b', 3, 10);

      expect(messageRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  describe('findAllInvolving', () => {
    it('should return all messages where user is sender or receiver', async () => {
      const messages = [createMessageFactory(), createMessageFactory()];
      messageRepo.find.mockResolvedValue(messages);

      const result = await repository.findAllInvolving('user-id');

      expect(messageRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [{ senderId: 'user-id' }, { receiverId: 'user-id' }],
          order: { createdAt: 'DESC' },
        }),
      );
      expect(result).toEqual(messages);
    });

    it('should return empty array when user has no messages', async () => {
      messageRepo.find.mockResolvedValue([]);

      const result = await repository.findAllInvolving('user-id');

      expect(result).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('should update the read flag to true', async () => {
      messageRepo.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      await repository.markAsRead('message-id');

      expect(messageRepo.update).toHaveBeenCalledWith({ id: 'message-id' }, { read: true });
    });
  });
});

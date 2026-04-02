import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

const USER_RELATIONS = ['sender', 'receiver'];

@Injectable()
export class MessagesRepository {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(senderId: string, receiverId: string, content: string): Promise<Message> {
    const message = this.messageRepository.create({ senderId, receiverId, content });
    const saved = await this.messageRepository.save(message);
    return this.findById(saved.id) as Promise<Message>;
  }

  async findById(id: string): Promise<Message | null> {
    return this.messageRepository.findOne({
      where: { id },
      relations: USER_RELATIONS,
    });
  }

  async findMessagesBetweenUsers(
    userId1: string,
    userId2: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[Message[], number]> {
    return this.messageRepository.findAndCount({
      where: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
      relations: USER_RELATIONS,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'ASC' },
    });
  }

  async findAllInvolving(userId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
      relations: USER_RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.messageRepository.update({ id: messageId }, { read: true });
  }
}

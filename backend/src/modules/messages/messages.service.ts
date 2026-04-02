import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { UsersService } from '../users/users.service';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

export interface ConversationData {
  otherUser: User;
  lastMessage: Message;
  unreadCount: number;
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly usersService: UsersService,
  ) {}

  async sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
    if (senderId === receiverId) {
      throw new BadRequestException('You cannot send a message to yourself');
    }
    await this.usersService.findById(receiverId);
    return this.messagesRepository.create(senderId, receiverId, content);
  }

  async getMessages(
    currentUserId: string,
    otherUserId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ messages: Message[]; total: number }> {
    const [messages, total] = await this.messagesRepository.findMessagesBetweenUsers(
      currentUserId,
      otherUserId,
      page,
      limit,
    );
    return { messages, total };
  }

  async getConversations(userId: string): Promise<ConversationData[]> {
    const allMessages = await this.messagesRepository.findAllInvolving(userId);

    const unreadCounts = new Map<string, number>();
    for (const msg of allMessages) {
      if (!msg.read && msg.receiverId === userId) {
        const count = unreadCounts.get(msg.senderId) ?? 0;
        unreadCounts.set(msg.senderId, count + 1);
      }
    }

    const seen = new Set<string>();
    const conversations: ConversationData[] = [];

    for (const msg of allMessages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (seen.has(partnerId)) continue;
      seen.add(partnerId);

      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      conversations.push({
        otherUser,
        lastMessage: msg,
        unreadCount: unreadCounts.get(partnerId) ?? 0,
      });
    }

    return conversations;
  }

  async markAsRead(userId: string, messageId: string): Promise<Message> {
    const message = await this.messagesRepository.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.receiverId !== userId) {
      throw new ForbiddenException('You can only mark your own received messages as read');
    }
    await this.messagesRepository.markAsRead(messageId);
    message.read = true;
    return message;
  }
}

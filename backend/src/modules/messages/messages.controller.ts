import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { MessagesService } from './messages.service';
import { CreateMessageDto, MessageResponseDto, ConversationResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Send a private message' })
  @ApiResponse({ status: 201, description: 'Message sent', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot send message to yourself / invalid input' })
  @ApiResponse({ status: 404, description: 'Recipient not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async sendMessage(
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: User,
  ): Promise<MessageResponseDto> {
    const message = await this.messagesService.sendMessage(user.id, dto.receiverId, dto.content);
    return plainToInstance(MessageResponseDto, message);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List all conversations for the current user' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved', type: [ConversationResponseDto] })
  async getConversations(@CurrentUser() user: User): Promise<ConversationResponseDto[]> {
    const conversations = await this.messagesService.getConversations(user.id);
    return conversations.map((conv) => ({
      otherUser: plainToInstance(UserResponseDto, conv.otherUser),
      lastMessage: plainToInstance(MessageResponseDto, conv.lastMessage),
      unreadCount: conv.unreadCount,
    }));
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get messages exchanged with a specific user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getMessages(
    @Param('userId', ParseUUIDPipe) otherUserId: string,
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const { messages, total } = await this.messagesService.getMessages(user.id, otherUserId, safePage, safeLimit);
    return {
      data: messages.map((m) => plainToInstance(MessageResponseDto, m)),
      meta: { total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a received message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read', type: MessageResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - can only mark own received messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) messageId: string,
    @CurrentUser() user: User,
  ): Promise<MessageResponseDto> {
    const message = await this.messagesService.markAsRead(user.id, messageId);
    return plainToInstance(MessageResponseDto, message);
  }
}

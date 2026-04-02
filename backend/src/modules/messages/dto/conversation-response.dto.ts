import { ApiProperty } from '@nestjs/swagger';
import { MessageResponseDto } from './message-response.dto';
import { UserResponseDto } from '../../users/dto';

export class ConversationResponseDto {
  @ApiProperty({ type: UserResponseDto, description: 'The other user in the conversation' })
  otherUser: UserResponseDto;

  @ApiProperty({ type: MessageResponseDto, description: 'Most recent message' })
  lastMessage: MessageResponseDto;

  @ApiProperty({ example: 3, description: 'Number of unread messages from the other user' })
  unreadCount: number;
}

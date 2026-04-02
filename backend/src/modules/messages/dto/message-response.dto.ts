import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto';

@Exclude()
export class MessageResponseDto {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Hello!' })
  content: string;

  @Expose()
  @ApiProperty({ example: false })
  read: boolean;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  senderId: string;

  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  receiverId: string;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: UserResponseDto, description: 'Sender info' })
  sender: UserResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: UserResponseDto, description: 'Receiver info' })
  receiver: UserResponseDto;

  @Expose()
  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}

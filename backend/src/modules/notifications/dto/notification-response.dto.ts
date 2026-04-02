import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto';
import { NotificationType } from '../entities/notification.entity';

@Exclude()
export class NotificationResponseDto {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @Expose()
  @ApiProperty({ enum: NotificationType, example: NotificationType.LIKE })
  type: NotificationType;

  @Expose()
  @ApiProperty({ description: 'ID of the like, comment, or message that triggered this notification' })
  referenceId: string;

  @Expose()
  @ApiProperty({ example: false })
  read: boolean;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: UserResponseDto, description: 'User who triggered the notification' })
  actor: UserResponseDto;

  @Expose()
  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}

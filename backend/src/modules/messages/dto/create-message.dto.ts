import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: 'UUID of the recipient user', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({ description: 'Message content', example: 'Hello!', maxLength: 1000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}

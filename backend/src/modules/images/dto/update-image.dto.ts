import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';

export class UpdateImageDto {
  @ApiPropertyOptional({
    description: 'Image description',
    example: 'Updated description',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Hashtags for the image (without # symbol)',
    example: ['updated', 'tags'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    each: true,
    message: 'Hashtags can only contain letters, numbers, and underscores',
  })
  hashtags?: string[];

  @ApiPropertyOptional({
    description: 'User IDs to mention in the image',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  mentionedUserIds?: string[];
}

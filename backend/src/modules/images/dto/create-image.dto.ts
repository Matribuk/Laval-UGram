import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

function parseHashtags(value: unknown): string[] | undefined {
  if (!value) {
    return undefined;
  }

  const stripHashSymbol = (tag: string): string => {
    const trimmed = tag.trim().toLowerCase();
    return trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  };

  if (typeof value === 'string') {
    return value
      .split(',')
      .map(stripHashSymbol)
      .filter((tag) => tag.length > 0);
  }

  if (Array.isArray(value)) {
    return value
      .filter((tag) => typeof tag === 'string')
      .map((tag: string) => stripHashSymbol(tag))
      .filter((tag) => tag.length > 0);
  }

  return undefined;
}

function parseUserIds(value: unknown): string[] | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
  }

  if (Array.isArray(value)) {
    return value
      .filter((id) => typeof id === 'string')
      .map((id: string) => id.trim());
  }

  return undefined;
}

export class CreateImageDto {
  @ApiPropertyOptional({
    description: 'Image description',
    example: 'Beautiful sunset at the beach',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Hashtags for the image (without # symbol)',
    example: ['sunset', 'beach', 'nature'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    each: true,
    message: 'Hashtags can only contain letters, numbers, and underscores',
  })
  @Transform(({ value }) => parseHashtags(value))
  hashtags?: string[];

  @ApiPropertyOptional({
    description: 'User IDs to mention in the image (must be valid UUIDs)',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsUUID('4', {
    each: true,
    message:
      'Each mentionedUserIds must be a valid UUID (e.g., 550e8400-e29b-41d4-a716-446655440000). Usernames like "@username" are not accepted.',
  })
  @Transform(({ value }) => parseUserIds(value))
  mentionedUserIds?: string[];

  @ApiPropertyOptional({
    description:
      'Name of the filter applied client-side before upload (e.g., "sepia", "grayscale")',
    example: 'sepia',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  appliedFilter?: string;
}

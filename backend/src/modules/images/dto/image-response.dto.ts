import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto';

class HashtagResponseDto {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'sunset' })
  name: string;
}

class MentionResponseDto {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: UserResponseDto })
  mentionedUser: UserResponseDto;
}

@Exclude()
export class ImageResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Image unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Original image URL',
    example: '/uploads/550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  url: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Thumbnail image URL (150px wide)',
    example: '/uploads/550e8400-e29b-41d4-a716-446655440000_thumbnail.jpg',
  })
  thumbnailUrl?: string | null;

  @Expose()
  @ApiPropertyOptional({
    description: 'Medium image URL (600px wide)',
    example: '/uploads/550e8400-e29b-41d4-a716-446655440000_medium.jpg',
  })
  mediumUrl?: string | null;

  @Expose()
  @ApiPropertyOptional({
    description: 'Image description',
    example: 'Beautiful sunset at the beach',
  })
  description?: string;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({
    description: 'User who uploaded the image',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @Expose()
  @Type(() => HashtagResponseDto)
  @ApiProperty({
    description: 'Image hashtags',
    type: [HashtagResponseDto],
  })
  hashtags: HashtagResponseDto[];

  @Expose()
  @Type(() => MentionResponseDto)
  @ApiProperty({
    description: 'Mentioned users',
    type: [MentionResponseDto],
  })
  mentions: MentionResponseDto[];

  @Expose()
  @ApiPropertyOptional({ description: 'Total number of likes', example: 42 })
  likeCount?: number;

  @Expose()
  @ApiPropertyOptional({ description: 'Total number of comments', example: 7 })
  commentCount?: number;

  @Expose()
  @ApiPropertyOptional({ description: 'Whether the current user has liked this image', example: true })
  likedByCurrentUser?: boolean;

  @Expose()
  @ApiProperty({
    description: 'Upload date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

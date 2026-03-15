import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({
    description: 'User unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Unique username',
    example: 'john_doe',
  })
  username: string;

  @Expose()
  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  email: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
  })
  firstName?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
  })
  lastName?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  phoneNumber?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
  })
  profilePictureUrl?: string;

  @Expose()
  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;
}

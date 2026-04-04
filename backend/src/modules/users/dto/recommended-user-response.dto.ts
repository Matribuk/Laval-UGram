import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserResponseDto } from './user-response.dto';

export class RecommendedUserResponseDto extends UserResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Popularity score (images posted + likes received + comments received)',
    example: 42,
  })
  popularityScore: number;
}

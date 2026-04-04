import { ApiProperty } from '@nestjs/swagger';

export class LikeStatusDto {
  @ApiProperty({ description: 'Total number of likes on the image' })
  likeCount: number;

  @ApiProperty({ description: 'Whether the current user has liked the image' })
  likedByCurrentUser: boolean;
}

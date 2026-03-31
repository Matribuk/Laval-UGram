import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { LikeStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Likes')
@Controller('images')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':imageId/likes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like an image' })
  @ApiResponse({ status: 200, description: 'Image liked successfully', type: LikeStatusDto })
  @ApiResponse({ status: 404, description: 'Image not found' })
  @ApiResponse({ status: 409, description: 'Image already liked' })
  async addLike(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser() user: User,
  ): Promise<LikeStatusDto> {
    return this.likesService.addLike(user.id, imageId);
  }

  @Delete(':imageId/likes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike an image' })
  @ApiResponse({ status: 200, description: 'Image unliked successfully', type: LikeStatusDto })
  @ApiResponse({ status: 404, description: 'Like not found' })
  async removeLike(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser() user: User,
  ): Promise<LikeStatusDto> {
    return this.likesService.removeLike(user.id, imageId);
  }

  @Get(':imageId/likes')
  @ApiOperation({ summary: 'Get like status for an image' })
  @ApiResponse({ status: 200, description: 'Like status retrieved', type: LikeStatusDto })
  async getLikeStatus(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser() user: User,
  ): Promise<LikeStatusDto> {
    return this.likesService.getLikeStatus(user.id, imageId);
  }
}

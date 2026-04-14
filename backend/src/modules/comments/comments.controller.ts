import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CommentsService } from './comments.service';
import { CreateCommentDto, CommentResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Comments')
@Controller('images')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':imageId/comments')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Add a comment to an image' })
  @ApiResponse({ status: 201, description: 'Comment added successfully', type: CommentResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async addComment(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.addComment(user.id, imageId, createCommentDto.content);
    return plainToInstance(CommentResponseDto, comment);
  }

  @Delete(':imageId/comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only delete own comments' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async removeComment(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.commentsService.removeComment(user.id, commentId);
  }

  @Get(':imageId/comments')
  @ApiOperation({ summary: 'Get comments for an image' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  async getCommentsByImage(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const { comments, total } = await this.commentsService.getCommentsByImage(imageId, safePage, safeLimit);
    return {
      data: comments.map((c) => plainToInstance(CommentResponseDto, c)),
      meta: { total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }
}

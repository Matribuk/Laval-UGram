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
  @ApiOperation({ summary: 'Add a comment to an image' })
  @ApiResponse({ status: 201, description: 'Comment added successfully', type: CommentResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Image not found' })
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
    const { comments, total } = await this.commentsService.getCommentsByImage(
      imageId,
      Number(page) || 1,
      Number(limit) || 10,
    );
    return {
      data: comments.map((c) => plainToInstance(CommentResponseDto, c)),
      meta: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        totalPages: Math.ceil(total / (Number(limit) || 10)),
      },
    };
  }
}

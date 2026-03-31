import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { UsersService } from './users.service';
import { UpdateUserDto, UserResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { ImagesService } from '../images/images.service';
import { ImageResponseDto } from '../images/dto';
import { StorageService } from '../storage/storage.service';
import { LikesService } from '../likes/likes.service';
import { CommentsService } from '../comments/comments.service';
import { CommentResponseDto } from '../comments/dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ImagesService))
    private readonly imagesService: ImagesService,
    private readonly storageService: StorageService,
    private readonly likesService: LikesService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { users, total } = await this.usersService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
    );
    return {
      data: users.map((user) => plainToInstance(UserResponseDto, user)),
      meta: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        totalPages: Math.ceil(total / (Number(limit) || 10)),
      },
    };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search users by username' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Username search query' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Users matching search query retrieved successfully',
  })
  async searchByUsername(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { users, total } = await this.usersService.searchByUsername(
      query || '',
      Number(page) || 1,
      Number(limit) || 10,
    );
    return {
      data: users.map((user) => plainToInstance(UserResponseDto, user)),
      meta: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        totalPages: Math.ceil(total / (Number(limit) || 10)),
      },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved',
    type: UserResponseDto,
  })
  async getCurrentUser(@CurrentUser() user: User) {
    return plainToInstance(UserResponseDto, user);
  }

  @Get('me/liked-images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get images liked by the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Liked images retrieved successfully' })
  async getLikedImages(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { images, total } = await this.likesService.getLikedImages(
      user.id,
      Number(page) || 1,
      Number(limit) || 10,
    );
    return {
      data: images.map((image) => plainToInstance(ImageResponseDto, image)),
      meta: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        totalPages: Math.ceil(total / (Number(limit) || 10)),
      },
    };
  }

  @Get('me/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comments made by the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'User comments retrieved successfully' })
  async getUserComments(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { comments, total } = await this.commentsService.getCommentsByUser(
      user.id,
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    return plainToInstance(UserResponseDto, user);
  }

  @Get(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get images by user ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'User images retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserImages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    await this.usersService.findById(id);
    const { images, total } = await this.imagesService.findByUserId(
      id,
      Number(page) || 1,
      Number(limit) || 10,
    );
    return {
      data: images.map((image) => plainToInstance(ImageResponseDto, image)),
      meta: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        totalPages: Math.ceil(total / (Number(limit) || 10)),
      },
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot update other users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    const user = await this.usersService.update(id, updateUserDto);
    return plainToInstance(UserResponseDto, user);
  }

  @Post(':id/profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (JPEG, PNG, GIF, WebP)',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile picture uploaded successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot update other users profile picture' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async uploadProfilePicture(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile picture');
    }
    const { url } = await this.storageService.uploadImage(file);
    const user = await this.usersService.updateProfilePicture(id, url);
    return plainToInstance(UserResponseDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot delete other users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.id !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    await this.usersService.delete(id);
  }
}

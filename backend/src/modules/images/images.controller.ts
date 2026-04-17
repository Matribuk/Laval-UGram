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
  HttpCode,
  HttpStatus,
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
import { ImagesService } from './images.service';
import { CreateImageDto, UpdateImageDto, ImageResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, GIF, WebP)',
        },
        description: {
          type: 'string',
          description: 'Image description',
        },
        hashtags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Hashtags (can be comma-separated string or array)',
        },
        mentionedUserIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'User IDs to mention',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: ImageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createImageDto: CreateImageDto,
    @CurrentUser() user: User,
  ) {
    const image = await this.imagesService.create(file, createImageDto, user);
    return plainToInstance(ImageResponseDto, image);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all images (paginated, ordered by date)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Images retrieved successfully',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: User,
  ) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const { images, total } = await this.imagesService.findAllWithStats(user.id, safePage, safeLimit);
    return {
      data: images.map((image) => plainToInstance(ImageResponseDto, image)),
      meta: { total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search images by description' })
  @ApiQuery({ name: 'description', required: true, type: String, description: 'Search query for image descriptions' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Images matching search query retrieved successfully',
  })
  async searchByDescription(
    @Query('description') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: User,
  ) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const { images, total } = await this.imagesService.searchByDescriptionWithStats(query || '', user.id, safePage, safeLimit);
    return {
      data: images.map((image) => plainToInstance(ImageResponseDto, image)),
      meta: { total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  @Get('hashtag/:hashtag')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search images by hashtag' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Images with hashtag retrieved successfully',
  })
  async findByHashtag(
    @Param('hashtag') hashtag: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: User,
  ) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const { images, total } = await this.imagesService.findByHashtagWithStats(hashtag, user.id, safePage, safeLimit);
    return {
      data: images.map((image) => plainToInstance(ImageResponseDto, image)),
      meta: { total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single image by ID' })
  @ApiResponse({
    status: 200,
    description: 'Image retrieved successfully',
    type: ImageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const image = await this.imagesService.findByIdWithStats(id, user.id);
    return plainToInstance(ImageResponseDto, image);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an image' })
  @ApiResponse({
    status: 200,
    description: 'Image updated successfully',
    type: ImageResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot update other users images' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateImageDto: UpdateImageDto,
    @CurrentUser() user: User,
  ) {
    const image = await this.imagesService.update(id, updateImageDto, user);
    return plainToInstance(ImageResponseDto, image);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an image' })
  @ApiResponse({ status: 204, description: 'Image deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot delete other users images' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.imagesService.delete(id, user);
  }
}

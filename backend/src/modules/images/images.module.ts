import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImagesRepository } from './images.repository';
import { Image, Hashtag, ImageMention } from './entities';
import { Like } from '../likes/entities/like.entity';
import { Comment } from '../comments/entities/comment.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image, Hashtag, ImageMention, Like, Comment]),
    forwardRef(() => UsersModule),
  ],
  controllers: [ImagesController],
  providers: [ImagesService, ImagesRepository],
  exports: [ImagesService],
})
export class ImagesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { LikesRepository } from './likes.repository';
import { Like } from './entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like])],
  controllers: [LikesController],
  providers: [LikesService, LikesRepository],
  exports: [LikesService],
})
export class LikesModule {}

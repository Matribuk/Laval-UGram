import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Image } from './image.entity';

@Entity('image_mentions')
@Unique(['imageId', 'mentionedUserId'])
export class ImageMention {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Image, (image) => image.mentions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'image_id' })
  image: Image;

  @Column({ name: 'image_id' })
  imageId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentioned_user_id' })
  mentionedUser: User;

  @Column({ name: 'mentioned_user_id' })
  mentionedUserId: string;
}

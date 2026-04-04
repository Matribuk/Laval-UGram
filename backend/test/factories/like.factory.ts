import { v4 as uuidv4 } from 'uuid';
import { Like } from '../../src/modules/likes/entities/like.entity';
import { createUserFactory } from './user.factory';
import { createImageFactory } from './image.factory';

export const createLikeFactory = (overrides: Partial<Like> = {}): Like => {
  const user = overrides.user ?? createUserFactory();
  const image = overrides.image ?? createImageFactory();

  const like = new Like();
  like.id = overrides.id ?? uuidv4();
  like.userId = overrides.userId ?? user.id;
  like.user = user;
  like.imageId = overrides.imageId ?? image.id;
  like.image = image;
  like.createdAt = overrides.createdAt ?? new Date();

  return like;
};

export const createManyLikes = (count: number, imageId?: string): Like[] =>
  Array.from({ length: count }, () =>
    createLikeFactory({ imageId }),
  );

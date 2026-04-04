import { v4 as uuidv4 } from 'uuid';
import { Comment } from '../../src/modules/comments/entities/comment.entity';
import { createUserFactory } from './user.factory';
import { createImageFactory } from './image.factory';

export const createCommentFactory = (overrides: Partial<Comment> = {}): Comment => {
  const user = overrides.user ?? createUserFactory();
  const image = overrides.image ?? createImageFactory();

  const comment = new Comment();
  comment.id = overrides.id ?? uuidv4();
  comment.content = overrides.content ?? 'Nice photo!';
  comment.userId = overrides.userId ?? user.id;
  comment.user = user;
  comment.imageId = overrides.imageId ?? image.id;
  comment.image = image;
  comment.createdAt = overrides.createdAt ?? new Date();

  return comment;
};

export const createManyComments = (count: number, imageId?: string): Comment[] =>
  Array.from({ length: count }, () => createCommentFactory({ imageId }));

import { v4 as uuidv4 } from 'uuid';
import { Image } from '../../src/modules/images/entities/image.entity';
import { Hashtag } from '../../src/modules/images/entities/hashtag.entity';
import { ImageMention } from '../../src/modules/images/entities/image-mention.entity';
import { createUserFactory } from './user.factory';
import { User } from '../../src/modules/users/entities/user.entity';


let imageCounter = 0;

export const createImageFactory = (overrides: Partial<Image> = {}): Image => {
  const counter = ++imageCounter;
  const user = overrides.user ?? createUserFactory();

  const image = new Image();
  const uuid = uuidv4();
  image.id = overrides.id ?? uuidv4();
  image.url = overrides.url ?? `/uploads/${uuid}.jpg`;
  image.thumbnailUrl = overrides.thumbnailUrl ?? `/uploads/${uuid}_thumbnail.jpg`;
  image.mediumUrl = overrides.mediumUrl ?? `/uploads/${uuid}_medium.jpg`;
  (image as any).likeCount = (overrides as any).likeCount ?? 0;
  (image as any).commentCount = (overrides as any).commentCount ?? 0;
  (image as any).likedByCurrentUser = (overrides as any).likedByCurrentUser ?? false;
  image.description = overrides.description ?? `Test image description ${counter}`;
  image.userId = overrides.userId ?? user.id;
  image.user = user;
  image.hashtags = overrides.hashtags ?? [];
  image.mentions = overrides.mentions ?? [];
  image.createdAt = overrides.createdAt ?? new Date();
  image.updatedAt = overrides.updatedAt ?? new Date();

  return image;
};

export const createManyImages = (count: number, user?: User, baseOverrides: Partial<Image> = {}): Image[] => {
  const owner = user ?? createUserFactory();
  return Array.from({ length: count }, (_, i) =>
    createImageFactory({
      description: `Image ${i + 1} description`,
      user: owner,
      userId: owner.id,
      ...baseOverrides,
    }),
  );
};

export const createHashtagFactory = (name: string): Hashtag => {
  const hashtag = new Hashtag();
  hashtag.id = uuidv4();
  hashtag.name = name.toLowerCase().replace('#', '');
  return hashtag;
};

export const createManyHashtags = (names: string[]): Hashtag[] =>
  names.map((name) => createHashtagFactory(name));

export const createImageMentionFactory = (
  imageId: string,
  mentionedUser: User,
): ImageMention => {
  const mention = new ImageMention();
  mention.id = uuidv4();
  mention.imageId = imageId;
  mention.mentionedUserId = mentionedUser.id;
  mention.mentionedUser = mentionedUser;
  return mention;
};

export const resetImageCounter = (): void => {
  imageCounter = 0;
};

export interface CreateImageDto {
  description?: string;
  hashtags?: string[];
  mentionedUserIds?: string[];
}

export const createImageDtoFactory = (overrides: Partial<CreateImageDto> = {}): CreateImageDto => ({
  description: overrides.description ?? 'Test image with #hashtag',
  hashtags: overrides.hashtags ?? ['test', 'image'],
  mentionedUserIds: overrides.mentionedUserIds ?? [],
});

export interface UpdateImageDto {
  description?: string;
  hashtags?: string[];
  mentionedUserIds?: string[];
}

export const createUpdateImageDtoFactory = (overrides: Partial<UpdateImageDto> = {}): UpdateImageDto => ({
  description: overrides.description,
  hashtags: overrides.hashtags,
  mentionedUserIds: overrides.mentionedUserIds,
});

export const createMockFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File => ({
  fieldname: overrides.fieldname ?? 'image',
  originalname: overrides.originalname ?? 'test-image.jpg',
  encoding: overrides.encoding ?? '7bit',
  mimetype: overrides.mimetype ?? 'image/jpeg',
  size: overrides.size ?? 1024 * 100, // 100KB
  buffer: overrides.buffer ?? Buffer.from('fake-image-data'),
  destination: overrides.destination ?? '',
  filename: overrides.filename ?? '',
  path: overrides.path ?? '',
  stream: null as any,
});

export const createLargeFile = (): Express.Multer.File =>
  createMockFile({
    size: 10 * 1024 * 1024,
    buffer: Buffer.alloc(10 * 1024 * 1024),
  });

export const createInvalidTypeFile = (): Express.Multer.File =>
  createMockFile({
    mimetype: 'application/pdf',
    originalname: 'document.pdf',
  });

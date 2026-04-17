import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { ImagesService } from '../../images/images.service';
import { StorageService } from '../../storage/storage.service';
import { LikesService } from '../../likes/likes.service';
import { CommentsService } from '../../comments/comments.service';
import {
  createUserFactory,
  createManyUsers,
} from '../../../../test/factories/user.factory';
import {
  createMockFile,
  createManyImages,
} from '../../../../test/factories/image.factory';
import { createManyComments } from '../../../../test/factories/comment.factory';
import {
  createMockUsersService,
  createMockImagesService,
  createMockStorageService,
  createMockLikesService,
  createMockCommentsService,
} from '../../../../test/mocks/services.mock';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: ReturnType<typeof createMockUsersService>;
  let imagesService: ReturnType<typeof createMockImagesService>;
  let storageService: ReturnType<typeof createMockStorageService>;
  let likesService: ReturnType<typeof createMockLikesService>;
  let commentsService: ReturnType<typeof createMockCommentsService>;

  beforeEach(async () => {
    usersService = createMockUsersService();
    imagesService = createMockImagesService();
    storageService = createMockStorageService();
    likesService = createMockLikesService();
    commentsService = createMockCommentsService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: ImagesService, useValue: imagesService },
        { provide: StorageService, useValue: storageService },
        { provide: LikesService, useValue: likesService },
        { provide: CommentsService, useValue: commentsService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return paginated users with meta', async () => {
      
      const users = createManyUsers(3);
      usersService.findAll.mockResolvedValue({ users, total: 10 });

      
      const result = await controller.findAll(1, 3);

      
      expect(result.data).toHaveLength(3);
      expect(result.meta).toEqual({
        total: 10,
        page: 1,
        limit: 3,
        totalPages: 4,
      });
    });

    it('should use default pagination values', async () => {
      
      usersService.findAll.mockResolvedValue({ users: [], total: 0 });

      
      await controller.findAll();

      
      expect(usersService.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should transform users to UserResponseDto', async () => {
      
      const users = createManyUsers(1);
      usersService.findAll.mockResolvedValue({ users, total: 1 });

      
      const result = await controller.findAll(1, 10);

      
      expect(result.data[0]).not.toHaveProperty('passwordHash');
    });
  });

  describe('GET /users/search', () => {
    it('should search users by username query', async () => {
      
      const users = createManyUsers(2);
      usersService.searchByUsername.mockResolvedValue({ users, total: 2 });

      
      const result = await controller.searchByUsername('test', 1, 10);

      
      expect(result.data).toHaveLength(2);
      expect(usersService.searchByUsername).toHaveBeenCalledWith('test', 1, 10);
    });

    it('should handle empty query parameter', async () => {
      
      usersService.searchByUsername.mockResolvedValue({ users: [], total: 0 });

      
      await controller.searchByUsername('', 1, 10);

      
      expect(usersService.searchByUsername).toHaveBeenCalledWith('', 1, 10);
    });

    it('should return paginated search results with meta', async () => {
      
      const users = createManyUsers(5);
      usersService.searchByUsername.mockResolvedValue({ users, total: 15 });

      
      const result = await controller.searchByUsername('user', 1, 5);

      
      expect(result.meta).toEqual({
        total: 15,
        page: 1,
        limit: 5,
        totalPages: 3,
      });
    });
  });

  describe('GET /users/me', () => {
    it('should return current authenticated user', async () => {
      
      const currentUser = createUserFactory({
        id: 'current-user-id',
        username: 'currentuser',
      });

      
      const result = await controller.getCurrentUser(currentUser);

      
      expect(result).toHaveProperty('id', 'current-user-id');
      expect(result).toHaveProperty('username', 'currentuser');
    });

    it('should transform to UserResponseDto', async () => {
      
      const currentUser = createUserFactory();

      
      const result = await controller.getCurrentUser(currentUser);

      
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      
      const user = createUserFactory();
      usersService.findById.mockResolvedValue(user);

      
      const result = await controller.findOne(user.id);

      
      expect(result).toHaveProperty('id', user.id);
      expect(usersService.findById).toHaveBeenCalledWith(user.id);
    });

    it('should transform user to UserResponseDto', async () => {
      
      const user = createUserFactory();
      usersService.findById.mockResolvedValue(user);

      
      const result = await controller.findOne(user.id);

      
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('GET /users/:id/images', () => {
    it('should return paginated user images', async () => {
      const user = createUserFactory();
      const currentUser = createUserFactory();
      const images = createManyImages(3, user);
      usersService.findById.mockResolvedValue(user);
      imagesService.findByUserIdWithStats.mockResolvedValue({ images, total: 3 });

      const result = await controller.findUserImages(user.id, 1, 10, currentUser);

      expect(result.data).toHaveLength(3);
      expect(result.meta.total).toBe(3);
    });

    it('should verify user exists before fetching images', async () => {
      const user = createUserFactory();
      const currentUser = createUserFactory();
      usersService.findById.mockResolvedValue(user);
      imagesService.findByUserIdWithStats.mockResolvedValue({ images: [], total: 0 });

      await controller.findUserImages(user.id, 1, 10, currentUser);

      expect(usersService.findById).toHaveBeenCalledWith(user.id);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should throw ForbiddenException when updating other user', async () => {
      
      const currentUser = createUserFactory({ id: 'current-user-id' });
      const otherUserId = 'other-user-id';

      
      await expect(
        controller.update(otherUserId, { firstName: 'New' }, currentUser),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.update(otherUserId, { firstName: 'New' }, currentUser),
      ).rejects.toThrow('You can only update your own profile');
    });

    it('should allow user to update own profile', async () => {
      
      const currentUser = createUserFactory({ id: 'user-id' });
      const updatedUser = { ...currentUser, firstName: 'Updated' };
      usersService.update.mockResolvedValue(updatedUser);

      
      const result = await controller.update(
        currentUser.id,
        { firstName: 'Updated' },
        currentUser,
      );

      
      expect(result).toHaveProperty('firstName', 'Updated');
      expect(usersService.update).toHaveBeenCalledWith(currentUser.id, { firstName: 'Updated' });
    });

    it('should return updated user', async () => {
      
      const currentUser = createUserFactory();
      const updatedUser = { ...currentUser, lastName: 'NewName' };
      usersService.update.mockResolvedValue(updatedUser);

      
      const result = await controller.update(
        currentUser.id,
        { lastName: 'NewName' },
        currentUser,
      );

      
      expect(result).toHaveProperty('lastName', 'NewName');
    });
  });

  describe('POST /users/:id/profile-picture', () => {
    it('should throw ForbiddenException when uploading for other user', async () => {
      
      const currentUser = createUserFactory({ id: 'current-user-id' });
      const file = createMockFile();

      
      await expect(
        controller.uploadProfilePicture('other-user-id', file, currentUser),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.uploadProfilePicture('other-user-id', file, currentUser),
      ).rejects.toThrow('You can only update your own profile picture');
    });

    it('should upload image via storage service', async () => {
      
      const currentUser = createUserFactory();
      const file = createMockFile();
      storageService.uploadImage.mockResolvedValue({
        filename: 'uuid.jpg',
        url: '/uploads/uuid.jpg',
      });
      usersService.updateProfilePicture.mockResolvedValue({
        ...currentUser,
        profilePictureUrl: '/uploads/uuid.jpg',
      });

      
      await controller.uploadProfilePicture(currentUser.id, file, currentUser);

      
      expect(storageService.uploadImage).toHaveBeenCalledWith(file);
    });

    it('should update user profile picture url', async () => {
      
      const currentUser = createUserFactory();
      const file = createMockFile();
      const uploadedUrl = '/uploads/new-picture.jpg';
      storageService.uploadImage.mockResolvedValue({
        filename: 'new-picture.jpg',
        url: uploadedUrl,
      });
      usersService.updateProfilePicture.mockResolvedValue({
        ...currentUser,
        profilePictureUrl: uploadedUrl,
      });

      
      await controller.uploadProfilePicture(currentUser.id, file, currentUser);

      
      expect(usersService.updateProfilePicture).toHaveBeenCalledWith(
        currentUser.id,
        uploadedUrl,
      );
    });

    it('should return updated user with new profile picture', async () => {

      const currentUser = createUserFactory();
      const file = createMockFile();
      storageService.uploadImage.mockResolvedValue({
        filename: 'pic.jpg',
        url: '/uploads/pic.jpg',
      });
      usersService.updateProfilePicture.mockResolvedValue({
        ...currentUser,
        profilePictureUrl: '/uploads/pic.jpg',
      });


      const result = await controller.uploadProfilePicture(
        currentUser.id,
        file,
        currentUser,
      );


      expect(result).toHaveProperty('profilePictureUrl', '/uploads/pic.jpg');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should throw ForbiddenException when deleting other user', async () => {
      const currentUser = createUserFactory({ id: 'current-user-id' });
      const otherUserId = 'other-user-id';

      await expect(controller.delete(otherUserId, currentUser)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(controller.delete(otherUserId, currentUser)).rejects.toThrow(
        'You can only delete your own account',
      );
    });

    it('should allow user to delete own account', async () => {
      const currentUser = createUserFactory({ id: 'user-id' });
      usersService.delete.mockResolvedValue(undefined);

      await controller.delete(currentUser.id, currentUser);

      expect(usersService.delete).toHaveBeenCalledWith(currentUser.id);
    });

    it('should return undefined on successful deletion', async () => {
      const currentUser = createUserFactory();
      usersService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(currentUser.id, currentUser);

      expect(result).toBeUndefined();
    });
  });

  describe('GET /users/me/comments', () => {
    it('should return paginated comments for the current user', async () => {
      const user = createUserFactory();
      const comments = createManyComments(3, 'image-id');
      commentsService.getCommentsByUser.mockResolvedValue({ comments, total: 3 });

      const result = await controller.getUserComments(user, 1, 10);

      expect(commentsService.getCommentsByUser).toHaveBeenCalledWith(user.id, 1, 10);
      expect(result.data).toHaveLength(3);
      expect(result.meta.total).toBe(3);
    });

    it('should return empty list when user has no comments', async () => {
      const user = createUserFactory();
      commentsService.getCommentsByUser.mockResolvedValue({ comments: [], total: 0 });

      const result = await controller.getUserComments(user, 1, 10);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should calculate totalPages correctly', async () => {
      const user = createUserFactory();
      commentsService.getCommentsByUser.mockResolvedValue({ comments: [], total: 25 });

      const result = await controller.getUserComments(user, 1, 10);

      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('GET /users/recommended', () => {
    it('should return recommended users with popularityScore', async () => {
      const user = createUserFactory();
      const recommended = createManyUsers(3).map((u) => ({ ...u, popularityScore: 10 }));
      usersService.getRecommendedUsers.mockResolvedValue(recommended);

      const result = await controller.getRecommendedUsers(user, 5);

      expect(usersService.getRecommendedUsers).toHaveBeenCalledWith(user.id, 5);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no other users exist', async () => {
      const user = createUserFactory();
      usersService.getRecommendedUsers.mockResolvedValue([]);

      const result = await controller.getRecommendedUsers(user, 5);

      expect(result).toHaveLength(0);
    });

    it('should exclude the current user from results', async () => {
      const user = createUserFactory({ id: 'current-user-id' });
      const otherUsers = createManyUsers(2).map((u) => ({ ...u, popularityScore: 5 }));
      usersService.getRecommendedUsers.mockResolvedValue(otherUsers);

      await controller.getRecommendedUsers(user, 5);

      expect(usersService.getRecommendedUsers).toHaveBeenCalledWith('current-user-id', 5);
    });
  });

  describe('GET /users/me/liked-images', () => {
    it('should return paginated liked images for the current user', async () => {
      const user = createUserFactory();
      const images = createManyImages(2, user);
      likesService.getLikedImages.mockResolvedValue({ images, total: 2 });

      const result = await controller.getLikedImages(user, 1, 10);

      expect(likesService.getLikedImages).toHaveBeenCalledWith(user.id, 1, 10);
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should return empty list when user has no liked images', async () => {
      const user = createUserFactory();
      likesService.getLikedImages.mockResolvedValue({ images: [], total: 0 });

      const result = await controller.getLikedImages(user, 1, 10);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should calculate totalPages correctly', async () => {
      const user = createUserFactory();
      const images = createManyImages(5, user);
      likesService.getLikedImages.mockResolvedValue({ images, total: 15 });

      const result = await controller.getLikedImages(user, 1, 5);

      expect(result.meta.totalPages).toBe(3);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentsRepository } from '../comments.repository';
import { Comment } from '../entities/comment.entity';
import { createCommentFactory } from '../../../../test/factories';

const mockTypeOrmRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  findAndCount: jest.fn(),
});

describe('CommentsRepository', () => {
  let repository: CommentsRepository;
  let commentRepo: jest.Mocked<Repository<Comment>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsRepository,
        { provide: getRepositoryToken(Comment), useFactory: mockTypeOrmRepository },
      ],
    }).compile();

    repository = module.get<CommentsRepository>(CommentsRepository);
    commentRepo = module.get(getRepositoryToken(Comment));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create, save and return the comment with user relation', async () => {
      const comment = createCommentFactory();
      commentRepo.create.mockReturnValue(comment);
      commentRepo.save.mockResolvedValue(comment);
      commentRepo.findOne.mockResolvedValue(comment);

      const result = await repository.create('user-id', 'image-id', 'Nice photo!');

      expect(commentRepo.create).toHaveBeenCalledWith({
        userId: 'user-id',
        imageId: 'image-id',
        content: 'Nice photo!',
      });
      expect(commentRepo.save).toHaveBeenCalledWith(comment);
      expect(result).toEqual(comment);
    });
  });

  describe('findById', () => {
    it('should return a comment by id with user relation', async () => {
      const comment = createCommentFactory();
      commentRepo.findOne.mockResolvedValue(comment);

      const result = await repository.findById(comment.id);

      expect(commentRepo.findOne).toHaveBeenCalledWith({
        where: { id: comment.id },
        relations: ['user'],
      });
      expect(result).toEqual(comment);
    });

    it('should return null when comment does not exist', async () => {
      commentRepo.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a comment by id', async () => {
      commentRepo.delete.mockResolvedValue({ affected: 1, raw: {} });

      await repository.delete('comment-id');

      expect(commentRepo.delete).toHaveBeenCalledWith({ id: 'comment-id' });
    });
  });

  describe('findByImageId', () => {
    it('should return paginated comments for an image', async () => {
      const comments = [createCommentFactory(), createCommentFactory()];
      commentRepo.findAndCount.mockResolvedValue([comments, 2]);

      const [result, total] = await repository.findByImageId('image-id', 1, 10);

      expect(commentRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { imageId: 'image-id' }, skip: 0, take: 10 }),
      );
      expect(result).toEqual(comments);
      expect(total).toBe(2);
    });

    it('should apply correct pagination offset', async () => {
      commentRepo.findAndCount.mockResolvedValue([[], 0]);

      await repository.findByImageId('image-id', 3, 5);

      expect(commentRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });

    it('should return empty list when no comments exist', async () => {
      commentRepo.findAndCount.mockResolvedValue([[], 0]);

      const [result, total] = await repository.findByImageId('image-id', 1, 10);

      expect(result).toEqual([]);
      expect(total).toBe(0);
    });
  });
});

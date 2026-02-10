import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import { Image, Hashtag, ImageMention } from './entities';

@Injectable()
export class ImagesRepository {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,
    @InjectRepository(ImageMention)
    private readonly mentionRepository: Repository<ImageMention>,
  ) {}

  async create(imageData: Partial<Image>): Promise<Image> {
    const image = this.imageRepository.create(imageData);
    return this.imageRepository.save(image);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<[Image[], number]> {
    return this.imageRepository.findAndCount({
      relations: ['user', 'hashtags', 'mentions', 'mentions.mentionedUser'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Image | null> {
    return this.imageRepository.findOne({
      where: { id },
      relations: ['user', 'hashtags', 'mentions', 'mentions.mentionedUser'],
    });
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Image[], number]> {
    return this.imageRepository.findAndCount({
      where: { userId },
      relations: ['user', 'hashtags', 'mentions', 'mentions.mentionedUser'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, imageData: Partial<Image>): Promise<Image | null> {
    await this.imageRepository.update(id, {
      description: imageData.description,
    });
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.imageRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findOrCreateHashtags(names: string[]): Promise<Hashtag[]> {
    if (!names || names.length === 0) {
      return [];
    }

    const normalizedNames = names.map((name) => name.toLowerCase());
    const existingHashtags = await this.hashtagRepository.find({
      where: { name: In(normalizedNames) },
    });

    const existingNames = new Set(existingHashtags.map((h) => h.name));
    const newNames = normalizedNames.filter((name) => !existingNames.has(name));

    if (newNames.length > 0) {
      const newHashtags = newNames.map((name) =>
        this.hashtagRepository.create({ name }),
      );
      await this.hashtagRepository.save(newHashtags);
      return [...existingHashtags, ...newHashtags];
    }

    return existingHashtags;
  }

  async updateImageHashtags(imageId: string, hashtags: Hashtag[]): Promise<void> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId },
      relations: ['hashtags'],
    });

    if (image) {
      image.hashtags = hashtags;
      await this.imageRepository.save(image);
    }
  }

  async updateImageMentions(imageId: string, userIds: string[]): Promise<void> {
    await this.mentionRepository.delete({ imageId });

    if (userIds && userIds.length > 0) {
      const mentions = userIds.map((userId) =>
        this.mentionRepository.create({
          imageId,
          mentionedUserId: userId,
        }),
      );
      await this.mentionRepository.save(mentions);
    }
  }

  async getImageFilename(id: string): Promise<string | null> {
    const image = await this.imageRepository.findOne({
      where: { id },
      select: ['url'],
    });

    if (!image) {
      return null;
    }

    const parts = image.url.split('/');
    return parts[parts.length - 1];
  }

  async findByHashtag(
    hashtagName: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Image[], number]> {
    const normalizedName = hashtagName.toLowerCase();

    const queryBuilder = this.imageRepository
      .createQueryBuilder('image')
      .innerJoin('image.hashtags', 'hashtag', 'hashtag.name = :hashtagName', {
        hashtagName: normalizedName,
      })
      .leftJoinAndSelect('image.user', 'user')
      .leftJoinAndSelect('image.hashtags', 'allHashtags')
      .leftJoinAndSelect('image.mentions', 'mentions')
      .leftJoinAndSelect('mentions.mentionedUser', 'mentionedUser')
      .orderBy('image.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getManyAndCount();
  }

  async searchByDescription(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Image[], number]> {
    return this.imageRepository.findAndCount({
      where: { description: ILike(`%${query}%`) },
      relations: ['user', 'hashtags', 'mentions', 'mentions.mentionedUser'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }
}

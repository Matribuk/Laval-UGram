import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from './entities/user.entity';

export type UserWithScore = User & { popularityScore: number };

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<[User[], number]> {
    return this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return this.findById(id);
  }

  async updateProfilePicture(id: string, url: string): Promise<User | null> {
    await this.repository.update(id, { profilePictureUrl: url });
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.repository.count({ where: { username } });
    return count > 0;
  }

  async searchByUsername(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[User[], number]> {
    return this.repository.findAndCount({
      where: { username: ILike(`%${query}%`) },
      skip: (page - 1) * limit,
      take: limit,
      order: { username: 'ASC' },
    });
  }

  async findRecommended(currentUserId: string, limit: number = 5): Promise<UserWithScore[]> {
    const { entities, raw } = await this.repository
      .createQueryBuilder('u')
      .leftJoin('images', 'i', 'i.user_id = u.id')
      .leftJoin('likes', 'l', 'l.image_id = i.id')
      .leftJoin('comments', 'c', 'c.image_id = i.id')
      .addSelect(
        '(COUNT(DISTINCT i.id) + COUNT(DISTINCT l.id) + COUNT(DISTINCT c.id))',
        'popularity_score',
      )
      .where('u.id != :currentUserId', { currentUserId })
      .groupBy('u.id')
      .orderBy('popularity_score', 'DESC')
      .limit(limit)
      .getRawAndEntities();

    return entities.map((user, index) => ({
      ...user,
      popularityScore: Number(raw[index]?.popularity_score ?? 0),
    }));
  }
}

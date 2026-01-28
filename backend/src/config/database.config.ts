import { registerAs } from '@nestjs/config';
import { DATABASE_CONFIG } from './defaults';

export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: DATABASE_CONFIG.HOST,
  port: DATABASE_CONFIG.PORT,
  username: DATABASE_CONFIG.USERNAME,
  password: DATABASE_CONFIG.PASSWORD,
  database: DATABASE_CONFIG.DATABASE,
  autoLoadEntities: true,
  synchronize: DATABASE_CONFIG.SYNCHRONIZE,
}));

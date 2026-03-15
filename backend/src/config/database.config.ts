import { registerAs } from '@nestjs/config';
import { DATABASE_CONFIG } from './defaults';

export default registerAs('database', () => {
  const config: any = {
    type: 'postgres' as const,
    host: DATABASE_CONFIG.HOST,
    port: DATABASE_CONFIG.PORT,
    username: DATABASE_CONFIG.USERNAME,
    password: DATABASE_CONFIG.PASSWORD,
    database: DATABASE_CONFIG.DATABASE,
    autoLoadEntities: true,
    synchronize: DATABASE_CONFIG.SYNCHRONIZE,
  };

  if (DATABASE_CONFIG.SSL) {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
});

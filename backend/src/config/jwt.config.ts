import { registerAs } from '@nestjs/config';
import { JWT_CONFIG } from './defaults';

export default registerAs('jwt', () => ({
  secret: JWT_CONFIG.SECRET,
  expiresIn: JWT_CONFIG.EXPIRES_IN,
}));

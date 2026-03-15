import { registerAs } from '@nestjs/config';
import { GOOGLE_OAUTH_CONFIG } from './defaults';

export default registerAs('oauth', () => ({
  google: {
    clientId: GOOGLE_OAUTH_CONFIG.CLIENT_ID,
    clientSecret: GOOGLE_OAUTH_CONFIG.CLIENT_SECRET,
    callbackUrl: GOOGLE_OAUTH_CONFIG.CALLBACK_URL,
  },
}));

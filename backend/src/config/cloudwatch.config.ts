import { registerAs } from '@nestjs/config';
import { CLOUDWATCH_CONFIG } from './defaults';

export default registerAs('cloudwatch', () => ({
  enabled: CLOUDWATCH_CONFIG.ENABLED,
  namespacePrefix: CLOUDWATCH_CONFIG.NAMESPACE_PREFIX,
  region: CLOUDWATCH_CONFIG.REGION,
}));

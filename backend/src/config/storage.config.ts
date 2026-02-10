import { registerAs } from '@nestjs/config';
import { STORAGE_CONFIG } from './defaults';

export default registerAs('storage', () => ({
  type: STORAGE_CONFIG.TYPE,
  local: {
    uploadPath: STORAGE_CONFIG.LOCAL.UPLOAD_PATH,
  },
  s3: {
    region: STORAGE_CONFIG.S3.REGION,
    accessKeyId: STORAGE_CONFIG.S3.ACCESS_KEY_ID,
    secretAccessKey: STORAGE_CONFIG.S3.SECRET_ACCESS_KEY,
    bucket: STORAGE_CONFIG.S3.BUCKET,
  },
  maxFileSize: STORAGE_CONFIG.MAX_FILE_SIZE,
  allowedMimeTypes: [...STORAGE_CONFIG.ALLOWED_MIME_TYPES],
}));

import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  type: process.env.STORAGE_TYPE || 'local',
  local: {
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
  s3: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET,
  },
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? String(5 * 1024 * 1024), 10),
  allowedMimeTypes: (
    process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/gif,image/webp'
  ).split(','),
}));

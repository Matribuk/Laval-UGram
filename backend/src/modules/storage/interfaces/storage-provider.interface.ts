export interface IStorageProvider {
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(filename: string): Promise<void>;
  getUrl(filename: string): string;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

import { Test, TestingModule } from '@nestjs/testing';
import { ImageResizeService, IMAGE_SIZES } from '../image-resize.service';

const mockToBuffer = jest.fn();
const mockResize = jest.fn(() => ({ toBuffer: mockToBuffer }));
const mockSharp = jest.fn((_buffer: unknown) => ({ resize: mockResize }));

jest.mock('sharp', () => ({
  __esModule: true,
  default: (_buffer: unknown) => mockSharp(_buffer),
}));

describe('ImageResizeService', () => {
  let service: ImageResizeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageResizeService],
    }).compile();

    service = module.get<ImageResizeService>(ImageResizeService);
    jest.clearAllMocks();
  });

  describe('resize', () => {
    it('should call sharp with the provided buffer', async () => {
      const buffer = Buffer.from('fake-image');
      const resized = Buffer.from('resized-image');
      mockToBuffer.mockResolvedValue(resized);

      await service.resize(buffer, 150);

      expect(mockSharp).toHaveBeenCalledWith(buffer);
    });

    it('should resize to the given width with withoutEnlargement', async () => {
      const buffer = Buffer.from('fake-image');
      mockToBuffer.mockResolvedValue(Buffer.from('resized'));

      await service.resize(buffer, 300);

      expect(mockResize).toHaveBeenCalledWith({ width: 300, withoutEnlargement: true });
    });

    it('should return the buffer from toBuffer()', async () => {
      const resized = Buffer.from('resized-image');
      mockToBuffer.mockResolvedValue(resized);

      const result = await service.resize(Buffer.from('input'), 150);

      expect(result).toBe(resized);
    });
  });

  describe('generateVariants', () => {
    it('should generate both thumbnail and medium variants', async () => {
      const input = Buffer.from('input');
      const thumbnailBuffer = Buffer.from('thumbnail');
      const mediumBuffer = Buffer.from('medium');
      mockToBuffer
        .mockResolvedValueOnce(thumbnailBuffer)
        .mockResolvedValueOnce(mediumBuffer);

      const result = await service.generateVariants(input);

      expect(result).toEqual({ thumbnail: thumbnailBuffer, medium: mediumBuffer });
    });

    it('should resize thumbnail to IMAGE_SIZES.thumbnail width', async () => {
      mockToBuffer.mockResolvedValue(Buffer.from('data'));

      await service.generateVariants(Buffer.from('input'));

      const resizeCalls = mockResize.mock.calls as unknown as Array<[{ width: number }]>;
      expect(resizeCalls.some((call) => call[0]?.width === IMAGE_SIZES.thumbnail)).toBe(true);
    });

    it('should resize medium to IMAGE_SIZES.medium width', async () => {
      mockToBuffer.mockResolvedValue(Buffer.from('data'));

      await service.generateVariants(Buffer.from('input'));

      const resizeCalls = mockResize.mock.calls as unknown as Array<[{ width: number }]>;
      expect(resizeCalls.some((call) => call[0]?.width === IMAGE_SIZES.medium)).toBe(true);
    });
  });
});

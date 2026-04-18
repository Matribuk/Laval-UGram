import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CloudwatchService } from '../cloudwatch.service';

describe('CloudwatchService', () => {
  const buildService = async (
    cfg: Record<string, unknown>,
  ): Promise<CloudwatchService> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudwatchService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: unknown) =>
              key in cfg ? cfg[key] : fallback,
            ),
          },
        },
      ],
    }).compile();
    return module.get<CloudwatchService>(CloudwatchService);
  };

  it('is a no-op when disabled', async () => {
    const service = await buildService({ 'cloudwatch.enabled': false });
    expect(() =>
      service.publishMetric('Foo', 1, 'Count', 'Analytics'),
    ).not.toThrow();
  });

  it('does not block the caller (fire-and-forget)', async () => {
    const service = await buildService({
      'cloudwatch.enabled': true,
      'cloudwatch.namespacePrefix': 'Ugram',
      'cloudwatch.region': 'us-east-1',
    });

    const before = Date.now();
    service.publishMetric('Foo', 1, 'Count', 'Analytics');
    const elapsed = Date.now() - before;
    expect(elapsed).toBeLessThan(50);
  });
});

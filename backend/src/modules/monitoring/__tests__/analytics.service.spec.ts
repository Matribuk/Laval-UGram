import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../analytics.service';
import { CloudwatchService } from '../cloudwatch.service';
import { createMockCloudwatchService } from '../../../../test/mocks/services.mock';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let cloudwatch: ReturnType<typeof createMockCloudwatchService>;

  beforeEach(async () => {
    cloudwatch = createMockCloudwatchService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: CloudwatchService, useValue: cloudwatch },
      ],
    }).compile();
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  const cases: [keyof AnalyticsService, string][] = [
    ['trackSignup', 'UserSignup'],
    ['trackLogin', 'UserLogin'],
    ['trackPostCreated', 'PostCreated'],
    ['trackPostLiked', 'PostLiked'],
    ['trackPostCommented', 'PostCommented'],
    ['trackMessageSent', 'MessageSent'],
    ['trackFilterApplied', 'FilterApplied'],
  ];

  it.each(cases)('%s publishes %s in Analytics namespace', (method, metric) => {
    (service[method] as () => void)();
    expect(cloudwatch.publishMetric).toHaveBeenCalledWith(
      metric,
      1,
      'Count',
      'Analytics',
    );
  });
});

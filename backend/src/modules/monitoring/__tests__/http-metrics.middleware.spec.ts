import { HttpMetricsMiddleware } from '../middlewares/http-metrics.middleware';
import { createMockCloudwatchService } from '../../../../test/mocks/services.mock';

describe('HttpMetricsMiddleware', () => {
  it('publishes RequestCount and RequestLatency when response finishes', () => {
    const cloudwatch = createMockCloudwatchService();
    const middleware = new HttpMetricsMiddleware(cloudwatch as never);

    const listeners: Record<string, () => void> = {};
    const res = {
      on: jest.fn((event: string, cb: () => void) => {
        listeners[event] = cb;
      }),
    } as unknown as Parameters<HttpMetricsMiddleware['use']>[1];
    const next = jest.fn();

    middleware.use({} as never, res, next);

    expect(next).toHaveBeenCalled();
    expect(cloudwatch.publishMetric).not.toHaveBeenCalled();

    listeners.finish();

    expect(cloudwatch.publishMetric).toHaveBeenCalledWith(
      'RequestCount',
      1,
      'Count',
      'API',
    );
    expect(cloudwatch.publishMetric).toHaveBeenCalledWith(
      'RequestLatency',
      expect.any(Number),
      'Milliseconds',
      'API',
    );
  });
});

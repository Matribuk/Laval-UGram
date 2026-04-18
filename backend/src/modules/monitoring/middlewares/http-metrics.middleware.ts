import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CloudwatchService } from '../cloudwatch.service';

const API_NAMESPACE = 'API';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  constructor(private readonly cloudwatch: CloudwatchService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = Date.now();

    res.on('finish', () => {
      const latency = Date.now() - startedAt;
      this.cloudwatch.publishMetric('RequestCount', 1, 'Count', API_NAMESPACE);
      this.cloudwatch.publishMetric(
        'RequestLatency',
        latency,
        'Milliseconds',
        API_NAMESPACE,
      );
    });

    next();
  }
}

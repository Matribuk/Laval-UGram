import { Injectable } from '@nestjs/common';
import { CloudwatchService } from './cloudwatch.service';

const ANALYTICS_NAMESPACE = 'Analytics';

@Injectable()
export class AnalyticsService {
  constructor(private readonly cloudwatch: CloudwatchService) {}

  trackSignup(): void {
    this.cloudwatch.publishMetric(
      'UserSignup',
      1,
      'Count',
      ANALYTICS_NAMESPACE,
    );
  }

  trackLogin(): void {
    this.cloudwatch.publishMetric('UserLogin', 1, 'Count', ANALYTICS_NAMESPACE);
  }

  trackPostCreated(): void {
    this.cloudwatch.publishMetric(
      'PostCreated',
      1,
      'Count',
      ANALYTICS_NAMESPACE,
    );
  }

  trackPostLiked(): void {
    this.cloudwatch.publishMetric('PostLiked', 1, 'Count', ANALYTICS_NAMESPACE);
  }

  trackPostCommented(): void {
    this.cloudwatch.publishMetric(
      'PostCommented',
      1,
      'Count',
      ANALYTICS_NAMESPACE,
    );
  }

  trackMessageSent(): void {
    this.cloudwatch.publishMetric(
      'MessageSent',
      1,
      'Count',
      ANALYTICS_NAMESPACE,
    );
  }

  trackFilterApplied(): void {
    this.cloudwatch.publishMetric(
      'FilterApplied',
      1,
      'Count',
      ANALYTICS_NAMESPACE,
    );
  }
}

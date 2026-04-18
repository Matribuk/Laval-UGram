import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type MetricUnit = 'Count' | 'Milliseconds' | 'Seconds' | 'None';

@Injectable()
export class CloudwatchService {
  private readonly logger = new Logger(CloudwatchService.name);
  private readonly enabled: boolean;
  private readonly namespacePrefix: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('cloudwatch.enabled', false);
    this.namespacePrefix = this.configService.get<string>(
      'cloudwatch.namespacePrefix',
      'Ugram',
    );
    this.region = this.configService.get<string>(
      'cloudwatch.region',
      'us-east-1',
    );

    if (!this.enabled) {
      this.logger.log(
        'CloudWatch metrics disabled (NODE_ENV != production or CLOUDWATCH_ENABLED=false).',
      );
    }
  }

  publishMetric(
    name: string,
    value: number,
    unit: MetricUnit,
    namespaceSuffix: string,
  ): void {
    if (!this.enabled) {
      return;
    }

    const namespace = `${this.namespacePrefix}/${namespaceSuffix}`;

    void this.sendMetric(namespace, name, value, unit).catch((err: Error) => {
      this.logger.warn(
        `Failed to publish metric ${namespace}/${name}: ${err.message}`,
      );
    });
  }

  private async sendMetric(
    namespace: string,
    metricName: string,
    value: number,
    unit: MetricUnit,
  ): Promise<void> {
    const { CloudWatchClient, PutMetricDataCommand } =
      await import('@aws-sdk/client-cloudwatch');

    const client = new CloudWatchClient({ region: this.region });

    const command = new PutMetricDataCommand({
      Namespace: namespace,
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Timestamp: new Date(),
        },
      ],
    });

    await client.send(command);
  }
}

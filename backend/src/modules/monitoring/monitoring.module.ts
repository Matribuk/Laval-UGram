import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudwatchService } from './cloudwatch.service';
import { AnalyticsService } from './analytics.service';
import { HttpMetricsMiddleware } from './middlewares/http-metrics.middleware';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CloudwatchService, AnalyticsService, HttpMetricsMiddleware],
  exports: [CloudwatchService, AnalyticsService],
})
export class MonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpMetricsMiddleware).forRoutes('*');
  }
}

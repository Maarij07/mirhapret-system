import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsFilterDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
@Roles('admin', 'super_admin', 'store_manager')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverviewMetrics(@Query() filters: AnalyticsFilterDto) {
    const metrics = await this.analyticsService.getOverviewMetrics(filters);
    return {
      message: 'Overview metrics retrieved successfully',
      data: metrics,
    };
  }

  @Get('products')
  async getProductAnalytics(@Query() filters: AnalyticsFilterDto) {
    const analytics = await this.analyticsService.getProductAnalytics(filters);
    return {
      message: 'Product analytics retrieved successfully',
      data: analytics,
    };
  }

  @Get('customers')
  async getCustomerAnalytics(@Query() filters: AnalyticsFilterDto) {
    const analytics = await this.analyticsService.getCustomerAnalytics(filters);
    return {
      message: 'Customer analytics retrieved successfully',
      data: analytics,
    };
  }

  @Get('revenue')
  async getRevenueAnalytics(@Query() filters: AnalyticsFilterDto) {
    const analytics = await this.analyticsService.getRevenueAnalytics(filters);
    return {
      message: 'Revenue analytics retrieved successfully',
      data: analytics,
    };
  }

  @Get('orders')
  async getOrderAnalytics(@Query() filters: AnalyticsFilterDto) {
    const analytics = await this.analyticsService.getOrderAnalytics(filters);
    return {
      message: 'Order analytics retrieved successfully',
      data: analytics,
    };
  }

  @Get('categories')
  async getCategoryAnalytics(@Query() filters: AnalyticsFilterDto) {
    const analytics = await this.analyticsService.getCategoryAnalytics(filters);
    return {
      message: 'Category analytics retrieved successfully',
      data: analytics,
    };
  }

  @Get('conversion')
  async getConversionMetrics(@Query() filters: AnalyticsFilterDto) {
    const metrics = await this.analyticsService.getConversionMetrics(filters);
    return {
      message: 'Conversion metrics retrieved successfully',
      data: metrics,
    };
  }
}

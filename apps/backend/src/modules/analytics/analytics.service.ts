import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, Product, ProductAnalytic, User } from '../../entities';
import { AnalyticsFilterDto } from './dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductAnalytic)
    private analyticsRepository: Repository<ProductAnalytic>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getOverviewMetrics(filters?: AnalyticsFilterDto): Promise<any> {
    const startDate = filters?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters?.end_date || new Date();

    // Total Revenue
    const revenueResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total_revenue')
      .where('order.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('order.payment_status = :status', { status: 'paid' })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total_revenue || 0);

    // Total Orders
    const totalOrders = await this.ordersRepository.count({
      where: {
        created_at: Between(startDate, endDate),
      },
    });

    // Total Product Views
    const viewsResult = await this.analyticsRepository
      .createQueryBuilder('analytic')
      .select('COUNT(*)', 'total_views')
      .where('analytic.event_type = :type', { type: 'view' })
      .andWhere('analytic.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    const totalViews = parseInt(viewsResult?.total_views || 0);

    // Total Customers
    const totalCustomers = await this.usersRepository.count({
      where: {
        role: 'customer',
        created_at: Between(startDate, endDate),
      },
    });

    // Calculate trends (compare with previous period)
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(startDate.getTime());

    const prevRevenueResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total_revenue')
      .where('order.created_at BETWEEN :startDate AND :endDate', {
        startDate: prevStartDate,
        endDate: prevEndDate,
      })
      .andWhere('order.payment_status = :status', { status: 'paid' })
      .getRawOne();

    const prevRevenue = parseFloat(prevRevenueResult?.total_revenue || 0);
    const revenueTrend = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    return {
      total_revenue: totalRevenue,
      revenue_trend: revenueTrend,
      total_orders: totalOrders,
      total_views: totalViews,
      total_customers: totalCustomers,
      period: {
        start_date: startDate,
        end_date: endDate,
      },
    };
  }

  async getProductAnalytics(filters?: AnalyticsFilterDto): Promise<any> {
    const startDate = filters?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters?.end_date || new Date();

    const query = this.productsRepository
      .createQueryBuilder('product')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('product.sku', 'sku')
      .addSelect('product.view_count', 'total_views')
      .addSelect('product.purchase_count', 'total_purchases')
      .addSelect('product.average_rating', 'average_rating')
      .where('product.is_active = :active', { active: true });

    if (filters?.category_id) {
      query.andWhere('product.category_id = :category_id', { category_id: filters.category_id });
    }

    const products = await query.limit(20).getRawMany();

    return products.map((p) => ({
      ...p,
      conversion_rate: p.total_views > 0 ? (p.total_purchases / p.total_views) * 100 : 0,
    }));
  }

  async getCustomerAnalytics(filters?: AnalyticsFilterDto): Promise<any> {
    const startDate = filters?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters?.end_date || new Date();

    // Total customers
    const totalCustomers = await this.usersRepository.count({
      where: {
        role: 'customer',
        created_at: Between(startDate, endDate),
      },
    });

    // Customers with orders
    const customersWithOrders = await this.ordersRepository
      .createQueryBuilder('order')
      .select('COUNT(DISTINCT order.customer_id)', 'count')
      .where('order.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('order.customer_id IS NOT NULL')
      .getRawOne();

    // Average order value
    const avgOrderResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('AVG(order.total)', 'avg_value')
      .where('order.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    const avgOrderValue = parseFloat(avgOrderResult?.avg_value || 0);

    // Customer lifetime value
    const lifetimeValueResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.customer_id', 'customer_id')
      .addSelect('SUM(order.total)', 'total_spent')
      .where('order.payment_status = :status', { status: 'paid' })
      .groupBy('order.customer_id')
      .orderBy('total_spent', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total_customers: totalCustomers,
      customers_with_orders: parseInt(customersWithOrders?.count || 0),
      average_order_value: avgOrderValue,
      top_customers: lifetimeValueResult,
    };
  }

  async getRevenueAnalytics(filters?: AnalyticsFilterDto): Promise<any> {
    const startDate = filters?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters?.end_date || new Date();

    // Daily revenue
    const dailyRevenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select("DATE(order.created_at)", 'date')
      .addSelect('SUM(order.total)', 'revenue')
      .addSelect('COUNT(*)', 'orders')
      .where('order.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('order.payment_status = :status', { status: 'paid' })
      .groupBy("DATE(order.created_at)")
      .orderBy("DATE(order.created_at)", 'ASC')
      .getRawMany();

    // Revenue by payment method
    const revenueByMethod = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.payment_method', 'method')
      .addSelect('SUM(order.total)', 'revenue')
      .addSelect('COUNT(*)', 'count')
      .where('order.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('order.payment_status = :status', { status: 'paid' })
      .groupBy('order.payment_method')
      .getRawMany();

    return {
      daily_revenue: dailyRevenue,
      revenue_by_method: revenueByMethod,
    };
  }

  async getOrderAnalytics(filters?: AnalyticsFilterDto): Promise<any> {
    const startDate = filters?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters?.end_date || new Date();

    // Orders by status
    const ordersByStatus = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('order.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('order.status')
      .getRawMany();

    // Orders by payment status
    const ordersByPaymentStatus = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.payment_status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('order.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('order.payment_status')
      .getRawMany();

    // Average order value
    const avgOrderResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('AVG(order.total)', 'avg_value')
      .where('order.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return {
      orders_by_status: ordersByStatus,
      orders_by_payment_status: ordersByPaymentStatus,
      average_order_value: parseFloat(avgOrderResult?.avg_value || 0),
    };
  }

  async getCategoryAnalytics(filters?: AnalyticsFilterDto): Promise<any> {
    const startDate = filters?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters?.end_date || new Date();

    const categoryAnalytics = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .select('category.id', 'category_id')
      .addSelect('category.name', 'category_name')
      .addSelect('COUNT(product.id)', 'product_count')
      .addSelect('SUM(product.view_count)', 'total_views')
      .addSelect('SUM(product.purchase_count)', 'total_purchases')
      .where('product.is_active = :active', { active: true })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .getRawMany();

    return categoryAnalytics;
  }

  async getConversionMetrics(filters?: AnalyticsFilterDto): Promise<any> {
    const startDate = filters?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters?.end_date || new Date();

    // Total views
    const viewsResult = await this.analyticsRepository
      .createQueryBuilder('analytic')
      .select('COUNT(*)', 'total_views')
      .where('analytic.event_type = :type', { type: 'view' })
      .andWhere('analytic.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    const totalViews = parseInt(viewsResult?.total_views || 0);

    // Total purchases
    const totalOrders = await this.ordersRepository.count({
      where: {
        created_at: Between(startDate, endDate),
        payment_status: 'paid',
      },
    });

    // Cart abandonment (views - purchases)
    const cartAbandonment = totalViews > 0 ? ((totalViews - totalOrders) / totalViews) * 100 : 0;

    // Conversion rate
    const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

    return {
      total_views: totalViews,
      total_purchases: totalOrders,
      conversion_rate: conversionRate,
      cart_abandonment_rate: cartAbandonment,
    };
  }
}

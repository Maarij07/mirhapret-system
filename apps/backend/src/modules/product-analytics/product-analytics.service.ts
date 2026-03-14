import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductAnalytic } from '../../entities';
import { TrackProductEventDto } from './dto';

// Safe columns that can be used as sort metrics
const ALLOWED_SORT_METRICS: Record<string, keyof Product> = {
  purchases: 'purchase_count',
  views: 'view_count',
  rating: 'average_rating',
};

@Injectable()
export class ProductAnalyticsService {
  constructor(
    @InjectRepository(ProductAnalytic)
    private analyticRepository: Repository<ProductAnalytic>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async trackProductEvent(
    productId: string,
    trackProductEventDto: TrackProductEventDto,
    userId?: string,
  ) {
    const exists = await this.productRepository.count({ where: { id: productId } });
    if (!exists) {
      throw new NotFoundException('Product not found');
    }

    const analytic = this.analyticRepository.create({
      product_id: productId,
      user_id: userId as any,
      event_type: trackProductEventDto.event_type as 'view' | 'click' | 'add_to_cart' | 'purchase',
      referrer: trackProductEventDto.referrer,
    });

    return this.analyticRepository.save(analytic);
  }

  async getProductAnalytics(productId: string, eventType?: string, skip = 0, take = 100) {
    const exists = await this.productRepository.count({ where: { id: productId } });
    if (!exists) {
      throw new NotFoundException('Product not found');
    }

    // Paginated event list
    const where: any = { product_id: productId };
    if (eventType) where.event_type = eventType;

    const [events, total] = await this.analyticRepository.findAndCount({
      where,
      skip: Math.max(0, skip),
      take: Math.min(100, Math.max(1, take)),
      order: { created_at: 'DESC' },
    });

    // Aggregate metrics via SQL — never loads all rows into memory
    const countsRaw = await this.analyticRepository
      .createQueryBuilder('a')
      .select('a.event_type', 'event_type')
      .addSelect('COUNT(*)', 'count')
      .where('a.product_id = :productId', { productId })
      .groupBy('a.event_type')
      .getRawMany();

    const counts: Record<string, number> = { view: 0, click: 0, add_to_cart: 0, purchase: 0 };
    for (const row of countsRaw) {
      counts[row.event_type] = parseInt(row.count, 10);
    }

    const totalEvents = Object.values(counts).reduce((a, b) => a + b, 0);
    const conversionRate = counts.view > 0
      ? ((counts.purchase / counts.view) * 100).toFixed(2)
      : '0.00';

    return {
      product_id: productId,
      metrics: {
        total_events: totalEvents,
        views: counts.view,
        clicks: counts.click,
        add_to_cart: counts.add_to_cart,
        purchases: counts.purchase,
        conversion_rate: conversionRate,
      },
      events,
      total,
    };
  }

  async getTopProducts(limit = 10, metric = 'purchases') {
    const sortColumn = ALLOWED_SORT_METRICS[metric];
    if (!sortColumn) {
      throw new BadRequestException(
        `Invalid metric. Allowed values: ${Object.keys(ALLOWED_SORT_METRICS).join(', ')}`,
      );
    }

    const safeLimit = Math.min(50, Math.max(1, limit));

    return this.productRepository.find({
      where: { is_active: true },
      order: { [sortColumn]: 'DESC' },
      take: safeLimit,
      select: ['id', 'name', 'sku', 'price', 'view_count', 'purchase_count', 'average_rating'],
    });
  }

  async getProductPerformance(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      select: ['id', 'name', 'price', 'view_count', 'purchase_count'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const views = product.view_count || 0;
    const purchases = product.purchase_count || 0;
    const conversionRate = views > 0 ? ((purchases / views) * 100).toFixed(2) : '0.00';

    return {
      product_id: productId,
      product_name: product.name,
      total_views: views,
      total_purchases: purchases,
      conversion_rate: conversionRate,
      price: product.price,
      revenue: purchases * product.price,
    };
  }
}

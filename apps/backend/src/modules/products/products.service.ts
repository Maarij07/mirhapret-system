import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductAnalytic } from '../../entities';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductAnalytic)
    private analyticsRepository: Repository<ProductAnalytic>,
  ) {}

  private generateSku(): string {
    return `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async findAll(filters?: {
    category_id?: string;
    search?: string;
    is_active?: boolean;
    is_featured?: boolean;
    min_price?: number;
    max_price?: number;
    skip?: number;
    take?: number;
  }): Promise<{ data: Product[]; total: number }> {
    const query = this.productsRepository.createQueryBuilder('product');

    if (filters?.category_id) {
      query.andWhere('product.category_id = :category_id', { category_id: filters.category_id });
    }

    if (filters?.search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.is_active !== undefined) {
      query.andWhere('product.is_active = :is_active', { is_active: filters.is_active });
    }

    if (filters?.is_featured !== undefined) {
      query.andWhere('product.is_featured = :is_featured', { is_featured: filters.is_featured });
    }

    if (filters?.min_price !== undefined || filters?.max_price !== undefined) {
      const min = filters?.min_price || 0;
      const max = filters?.max_price || 999999;
      query.andWhere('product.price BETWEEN :min AND :max', { min, max });
    }

    const total = await query.getCount();

    const skip = Math.max(0, filters?.skip || 0);
    const take = Math.min(100, Math.max(1, filters?.take || 20));

    const data = await query
      .orderBy('product.created_at', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();

    return { data, total };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { sku },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { slug },
      relations: ['category'],
    });
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if SKU already exists (if provided)
    if (createProductDto.barcode) {
      const existing = await this.findBySku(createProductDto.barcode);
      if (existing) {
        throw new BadRequestException('SKU already exists');
      }
    }

    const sku = createProductDto.barcode || this.generateSku();
    const slug = this.generateSlug(createProductDto.name);

    // Check if slug already exists
    const existingSlug = await this.findBySlug(slug);
    if (existingSlug) {
      throw new BadRequestException('Product name already exists');
    }

    const product = this.productsRepository.create({
      ...createProductDto,
      sku,
      slug,
      available_sizes: createProductDto.available_sizes || ['S', 'M', 'L', 'XL'],
    });

    return this.productsRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);

    // If name is being updated, regenerate slug
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const newSlug = this.generateSlug(updateProductDto.name);
      const existingSlug = await this.productsRepository.findOne({
        where: { slug: newSlug },
      });
      if (existingSlug && existingSlug.id !== id) {
        throw new BadRequestException('Product name already exists');
      }
      updateProductDto['slug'] = newSlug;
    }

    await this.productsRepository.update(id, updateProductDto);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.productsRepository.delete(id);
  }

  async trackView(
    productId: string,
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
    durationSeconds?: number,
  ): Promise<void> {
    // Verify product exists
    await this.findById(productId);

    const analytic = this.analyticsRepository.create({
      product_id: productId as any,
      user_id: userId as any,
      guest_session_id: sessionId,
      ip_address: ipAddress,
      user_agent: userAgent,
      event_type: 'view',
      duration_seconds: durationSeconds || 0,
    });

    await this.analyticsRepository.save(analytic);

    // Increment view count
    await this.productsRepository.increment(
      { id: productId },
      'view_count',
      1,
    );
  }

  async getProductAnalytics(productId: string): Promise<any> {
    await this.findById(productId);

    const analytics = await this.analyticsRepository
      .createQueryBuilder('analytic')
      .where('analytic.product_id = :productId', { productId })
      .groupBy('analytic.event_type')
      .select('analytic.event_type', 'event_type')
      .addSelect('COUNT(*)', 'count')
      .getRawMany();

    return analytics;
  }
}

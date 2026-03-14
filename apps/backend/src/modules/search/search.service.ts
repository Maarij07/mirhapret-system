import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product, Category } from '../../entities';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async searchAll(query: string, skip = 0, take = 20) {
    const searchQuery = `%${query}%`;

    const [products, productCount] = await this.productRepository.findAndCount({
      where: [
        { name: ILike(searchQuery) },
        { description: ILike(searchQuery) },
        { sku: ILike(searchQuery) },
      ],
      relations: ['category'],
      skip,
      take,
    });

    const [categories, categoryCount] = await this.categoryRepository.findAndCount({
      where: [{ name: ILike(searchQuery) }, { description: ILike(searchQuery) }],
      skip: 0,
      take: 5,
    });

    return {
      query,
      results: {
        products: { data: products, count: productCount },
        categories: { data: categories, count: categoryCount },
      },
    };
  }

  async searchProducts(query: string, filters: any = {}, skip = 0, take = 20) {
    let queryBuilder = this.productRepository.createQueryBuilder('product').where('product.is_active = true');

    // Full-text search
    if (query) {
      queryBuilder = queryBuilder.andWhere(
        '(product.name ILIKE :query OR product.description ILIKE :query OR product.sku ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    // Category filter
    if (filters.category_id) {
      queryBuilder = queryBuilder.andWhere('product.category_id = :category_id', {
        category_id: filters.category_id,
      });
    }

    // Price range filter
    if (filters.min_price) {
      queryBuilder = queryBuilder.andWhere('product.price >= :min_price', {
        min_price: filters.min_price,
      });
    }
    if (filters.max_price) {
      queryBuilder = queryBuilder.andWhere('product.price <= :max_price', {
        max_price: filters.max_price,
      });
    }

    // Featured filter
    if (filters.is_featured) {
      queryBuilder = queryBuilder.andWhere('product.is_featured = :is_featured', {
        is_featured: filters.is_featured === 'true',
      });
    }

    const [products, total] = await queryBuilder
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.name', 'ASC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return { products, total };
  }

  async getSearchSuggestions(query: string, limit = 10) {
    limit = Math.min(20, Math.max(1, limit));
    const products = await this.productRepository.find({
      where: [
        { name: ILike(`${query}%`) },
        { sku: ILike(`${query}%`) },
      ],
      select: ['id', 'name', 'sku'],
      take: limit,
    });

    const categories = await this.categoryRepository.find({
      where: { name: ILike(`${query}%`) },
      select: ['id', 'name'],
      take: 5,
    });

    return {
      products: products.map(p => ({ id: p.id, name: p.name, type: 'product' })),
      categories: categories.map(c => ({ id: c.id, name: c.name, type: 'category' })),
    };
  }

  async getTrendingSearches(limit = 10) {
    limit = Math.min(50, Math.max(1, limit));
    // Return recently added/updated products as trending
    const trending = await this.productRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
      take: limit,
      select: ['id', 'name', 'price'],
    });

    return trending;
  }
}

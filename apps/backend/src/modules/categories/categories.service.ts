import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async findAll(isActive: boolean | null = true) {
    const query = this.categoriesRepository.createQueryBuilder('category');

    if (isActive !== null) {
      query.where('category.is_active = :isActive', { isActive });
    }

    return query.orderBy('category.sort_order', 'ASC').getMany();
  }

  async findBySlug(slug: string) {
    const category = await this.categoriesRepository.findOne({
      where: { slug, is_active: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return category;
  }

  async findById(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = this.generateSlug(createCategoryDto.name);

    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      slug,
      is_active: createCategoryDto.is_active ?? true,
      sort_order: createCategoryDto.sort_order ?? 0,
    });

    return this.categoriesRepository.save(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    await this.findById(id);

    // If name is being updated, regenerate slug
    if (updateCategoryDto.name) {
      updateCategoryDto['slug'] = this.generateSlug(updateCategoryDto.name);
    }

    await this.categoriesRepository.update(id, updateCategoryDto);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.categoriesRepository.delete(id);
  }
}

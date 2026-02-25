import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async getAllCategories(@Query('is_active') is_active?: string) {
    const isActive = is_active === 'true' ? true : is_active === 'false' ? false : null;
    const categories = await this.categoriesService.findAll(isActive);
    return {
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }

  @Get(':slug')
  async getCategoryBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    return {
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return {
      message: 'Category updated successfully',
      data: category,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@Param('id') id: string) {
    await this.categoriesService.delete(id);
    return {
      message: 'Category deleted successfully',
    };
  }
}

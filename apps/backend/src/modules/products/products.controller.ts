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
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, TrackProductDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async getAllProducts(
    @Query('category_id') category_id?: string,
    @Query('search') search?: string,
    @Query('is_active') is_active?: string,
    @Query('is_featured') is_featured?: string,
    @Query('min_price') min_price?: string,
    @Query('max_price') max_price?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const filters = {
      category_id,
      search,
      is_active: is_active === 'true',
      is_featured: is_featured === 'true',
      min_price: min_price ? parseFloat(min_price) : undefined,
      max_price: max_price ? parseFloat(max_price) : undefined,
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
    };

    const result = await this.productsService.findAll(filters);
    return {
      message: 'Products retrieved successfully',
      data: result.data,
      pagination: {
        total: result.total,
        skip: filters.skip,
        take: filters.take,
      },
    };
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    const product = await this.productsService.findById(id);
    return {
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto);
    return {
      message: 'Product created successfully',
      data: product,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(id, updateProductDto);
    return {
      message: 'Product updated successfully',
      data: product,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('id') id: string) {
    await this.productsService.delete(id);
    return {
      message: 'Product deleted successfully',
    };
  }

  @Post(':id/track')
  @HttpCode(HttpStatus.OK)
  async trackProductView(
    @Param('id') id: string,
    @Body() trackProductDto: TrackProductDto,
  ) {
    await this.productsService.trackView(
      id,
      trackProductDto.user_id,
      trackProductDto.session_id,
      trackProductDto.ip_address,
      trackProductDto.user_agent,
      trackProductDto.duration_seconds,
    );
    return {
      message: 'Product view tracked successfully',
    };
  }

  @Get(':id/analytics')
  async getProductAnalytics(@Param('id') id: string) {
    const analytics = await this.productsService.getProductAnalytics(id);
    return {
      message: 'Product analytics retrieved successfully',
      data: analytics,
    };
  }
}

import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('product/:productId')
  async getProductInventory(
    @Param('productId') productId: string,
    @Query('storeId') storeId?: string,
  ) {
    const inventory = await this.inventoryService.getInventoryByProduct(productId, storeId);
    return {
      message: 'Product inventory retrieved successfully',
      data: inventory,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @HttpCode(HttpStatus.OK)
  async updateInventory(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    const inventory = await this.inventoryService.updateInventory(
      id,
      updateInventoryDto.quantity,
    );
    return {
      message: 'Inventory updated successfully',
      data: inventory,
    };
  }
}

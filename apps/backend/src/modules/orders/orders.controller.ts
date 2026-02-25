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
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async getAllOrders(
    @Query('customer_id') customer_id?: string,
    @Query('status') status?: string,
    @Query('payment_status') payment_status?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const filters = {
      customer_id,
      status,
      payment_status,
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
    };

    const result = await this.ordersService.findAll(filters);
    return {
      message: 'Orders retrieved successfully',
      data: result.data,
      pagination: {
        total: result.total,
        skip: filters.skip,
        take: filters.take,
      },
    };
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    const items = await this.ordersService.getOrderItems(id);
    return {
      message: 'Order retrieved successfully',
      data: {
        ...order,
        items,
      },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    return {
      message: 'Order created successfully',
      data: order,
    };
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.ordersService.updateStatus(
      id,
      updateOrderStatusDto.status,
      updateOrderStatusDto.admin_notes,
    );
    return {
      message: 'Order status updated successfully',
      data: order,
    };
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async cancelOrder(@Param('id') id: string) {
    const order = await this.ordersService.cancel(id);
    return {
      message: 'Order cancelled successfully',
      data: order,
    };
  }
}

import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem, PaymentTransaction } from '../../entities';
import { CreateOrderDto } from './dto';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(PaymentTransaction)
    private paymentTransactionsRepository: Repository<PaymentTransaction>,
    @Inject(InventoryService)
    private inventoryService: InventoryService,
  ) {}

  async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    // 8 alphanumeric chars = 36^8 ≈ 2.8 trillion combinations — no collision risk
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `ORD-${dateStr}-${random}`;
  }

  async findAll(filters?: {
    customer_id?: string;
    status?: string;
    payment_status?: string;
    skip?: number;
    take?: number;
  }): Promise<{ data: Order[]; total: number }> {
    const query = this.ordersRepository.createQueryBuilder('order');

    if (filters?.customer_id) {
      query.andWhere('order.customer_id = :customer_id', { customer_id: filters.customer_id });
    }

    if (filters?.status) {
      query.andWhere('order.status = :status', { status: filters.status });
    }

    if (filters?.payment_status) {
      query.andWhere('order.payment_status = :payment_status', { payment_status: filters.payment_status });
    }

    const total = await query.getCount();

    const skip = filters?.skip || 0;
    const take = filters?.take || 20;

    const data = await query
      .orderBy('order.created_at', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();

    return { data, total };
  }

  async findById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { order_number: orderNumber },
      relations: ['customer'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    return order;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const orderNumber = await this.generateOrderNumber();

      // Calculate totals
      const subtotal = createOrderDto.items.reduce((sum, item) => sum + (item.total || item.quantity * item.unit_price), 0);
      const taxAmount = createOrderDto.tax_amount || 0;
      const shippingAmount = createOrderDto.shipping_amount || 0;
      const discountAmount = createOrderDto.discount_amount || 0;
      const total = subtotal + taxAmount + shippingAmount - discountAmount;

      // Validate and reserve inventory for each item
      for (const item of createOrderDto.items) {
        const inventories = await this.inventoryService.getInventoryByProduct(item.product_id);
        const sizeInventory = inventories.find((inv) => inv.size === item.product_size);

        if (!sizeInventory) {
          throw new BadRequestException(
            `Product size ${item.product_size} not available for product ${item.product_id}`,
          );
        }

        const available = sizeInventory.quantity - (sizeInventory.reserved_quantity || 0);
        if (available < item.quantity) {
          throw new BadRequestException(
            `Insufficient inventory for ${item.product_size}. Available: ${available}, Requested: ${item.quantity}`,
          );
        }

        // Reserve inventory
        await this.inventoryService.reserveInventory(sizeInventory.id, item.quantity);
      }

      const order = this.ordersRepository.create({
        order_number: orderNumber,
        customer_id: (createOrderDto.customer_id || undefined) as any,
        customer_email: createOrderDto.customer_email,
        customer_phone: createOrderDto.customer_phone,
        customer_first_name: createOrderDto.customer_first_name,
        customer_last_name: createOrderDto.customer_last_name || '',
        shipping_address: createOrderDto.shipping_address,
        billing_address: createOrderDto.billing_address || createOrderDto.shipping_address,
        shipping_same_as_billing: !createOrderDto.billing_address,
        source: 'online',
        status: 'pending',
        payment_status: 'pending',
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: discountAmount,
        total,
        payment_method: createOrderDto.payment_method,
        notes: createOrderDto.notes,
      } as any);

      const savedOrder = await this.ordersRepository.save(order);
      const savedOrderId = (savedOrder as any).id;

      // Add order items
      if (createOrderDto.items && createOrderDto.items.length > 0) {
        await this.addOrderItems(savedOrderId, createOrderDto.items);
      }

      return this.findById(savedOrderId);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
  }

  async update(id: string, data: Partial<Order>): Promise<Order> {
    await this.findById(id);
    await this.ordersRepository.update(id, data);
    return this.findById(id);
  }

  async updateStatus(id: string, status: string, adminNotes?: string): Promise<Order> {
    await this.findById(id); // throws NotFoundException if not found

    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const updateData: any = { status };
    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    // If delivered, set completed_at
    if (status === 'delivered') {
      updateData.completed_at = new Date();
    }

    await this.ordersRepository.update(id, updateData);
    return this.findById(id);
  }

  async cancel(id: string): Promise<Order> {
    try {
      const order = await this.findById(id);

      if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
        throw new BadRequestException(`Cannot cancel order with status: ${order.status}`);
      }

      // Release reserved inventory
      const orderItems = await this.getOrderItems(id);
      for (const item of orderItems) {
        const inventories = await this.inventoryService.getInventoryByProduct(item.product_id as any);
        const sizeInventory = inventories.find((inv) => inv.size === item.product_size);

        if (sizeInventory) {
          await this.inventoryService.releaseReservedInventory(sizeInventory.id, item.quantity);
        }
      }

      return this.updateStatus(id, 'cancelled');
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Failed to cancel order: ${error.message}`);
    }
  }

  async addOrderItems(orderId: string, items: any[]): Promise<OrderItem[]> {
    const orderItems = items.map((item) => {
      const orderItem = new OrderItem();
      orderItem.order_id = orderId as any;
      orderItem.product_id = item.product_id as any;
      orderItem.product_name = item.product_name || '';
      orderItem.sku = item.sku || '';
      orderItem.product_size = item.product_size || '';
      orderItem.quantity = item.quantity || 1;
      orderItem.unit_price = item.unit_price || 0;
      orderItem.total = item.total || item.quantity * item.unit_price;
      return orderItem;
    });

    return this.orderItemsRepository.save(orderItems);
  }

  async createPaymentTransaction(
    orderId: string,
    data: Partial<PaymentTransaction>,
  ): Promise<PaymentTransaction> {
    const transaction = this.paymentTransactionsRepository.create({
      order_id: orderId as any,
      ...data,
    });

    return this.paymentTransactionsRepository.save(transaction);
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return this.orderItemsRepository.find({
      where: { order_id: orderId as any },
    });
  }
}

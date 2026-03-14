import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, PaymentTransaction, PaymentMethod } from '../../entities';
import { InitiatePaymentDto, ConfirmPaymentDto, CreatePaymentMethodDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private paymentRepository: Repository<PaymentTransaction>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async initiatePayment(userId: string, initiatePaymentDto: InitiatePaymentDto) {
    // Verify order exists and user owns it
    const order = await this.orderRepository.findOne({
      where: { id: initiatePaymentDto.order_id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.payment_status === 'paid') {
      throw new BadRequestException('Order already paid');
    }

    // Create payment transaction
    const payment = this.paymentRepository.create({
      order_id: initiatePaymentDto.order_id,
      amount: initiatePaymentDto.amount,
      currency: initiatePaymentDto.currency || 'PKR',
      payment_method: initiatePaymentDto.method,
      status: 'pending',
      provider_transaction_id: `pi_${uuidv4()}`, // Mock payment intent
      payment_provider: 'stripe', // Default, can be configured
    });

    const saved = await this.paymentRepository.save(payment);

    return {
      ...saved,
      client_secret: `${saved.provider_transaction_id}_secret`, // Mock client secret
    };
  }

  async confirmPayment(userId: string, confirmPaymentDto: ConfirmPaymentDto) {
    const payment = await this.paymentRepository.findOne({
      where: {
        order_id: confirmPaymentDto.order_id,
        provider_transaction_id: confirmPaymentDto.payment_intent_id,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Simulate payment confirmation
    payment.status = 'success';
    payment.updated_at = new Date();

    const saved = await this.paymentRepository.save(payment);

    // Update order payment status
    await this.orderRepository.update(confirmPaymentDto.order_id, {
      payment_status: 'paid',
    });

    return saved;
  }

  async getPaymentHistory(userId: string, skip = 0, take = 20) {
    const [payments, total] = await this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.order', 'order')
      .where('order.customer_id = :userId', { userId })
      .orderBy('payment.created_at', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return { payments, total };
  }

  async getPaymentStatus(paymentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  // Payment Methods Management
  async createPaymentMethod(userId: string, createPaymentMethodDto: CreatePaymentMethodDto) {
    // If setting as default, unset other defaults
    if (createPaymentMethodDto.is_default) {
      await this.paymentMethodRepository.update(
        { user_id: userId, is_default: true },
        { is_default: false },
      );
    }

    const method = this.paymentMethodRepository.create({
      user_id: userId,
      ...createPaymentMethodDto,
      is_default: createPaymentMethodDto.is_default || false,
      is_active: true,
    });

    return await this.paymentMethodRepository.save(method);
  }

  async getPaymentMethods(userId: string) {
    return await this.paymentMethodRepository.find({
      where: { user_id: userId, is_active: true },
      order: { is_default: 'DESC', created_at: 'DESC' },
    });
  }

  async deletePaymentMethod(userId: string, methodId: string) {
    const method = await this.paymentMethodRepository.findOne({
      where: { id: methodId, user_id: userId },
    });

    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    // Soft delete - mark as inactive
    method.is_active = false;
    await this.paymentMethodRepository.save(method);

    return { message: 'Payment method deleted' };
  }

  async refundPayment(paymentId: string, reason: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'success') {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    // Update payment status to refunded
    payment.status = 'refunded';
    payment.error_message = reason;
    payment.updated_at = new Date();

    const saved = await this.paymentRepository.save(payment);

    // Update order payment status to refunded
    await this.orderRepository.update(payment.order_id, {
      payment_status: 'refunded',
    });

    return saved;
  }
}

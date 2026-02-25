import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('orders')
@Index('idx_orders_number', { synchronize: false })
@Index('idx_orders_customer', { synchronize: false })
@Index('idx_orders_status', { synchronize: false })
@Index('idx_orders_payment_status', { synchronize: false })
@Index('idx_orders_created', { synchronize: false })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  order_number: string;

  @Column({ type: 'uuid', nullable: true })
  customer_id: string;

  @Column({ type: 'varchar', length: 255 })
  customer_email: string;

  @Column({ type: 'varchar', length: 20 })
  customer_phone: string;

  @Column({ type: 'varchar', length: 100 })
  customer_first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customer_last_name: string;

  @Column({ type: 'jsonb' })
  shipping_address: Record<string, any>;

  @Column({ type: 'jsonb' })
  billing_address: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  shipping_same_as_billing: boolean;

  @Column({ type: 'varchar', length: 20, default: 'online' })
  source: 'online' | 'pos';

  @Column({ type: 'uuid', nullable: true })
  store_id: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  shipping_amount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payment_method: string;

  @Column({ type: 'text', nullable: true })
  payment_transaction_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payment_provider: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tracking_number: string;

  @Column({ type: 'date', nullable: true })
  estimated_delivery_date: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pos_transaction_id: string;

  @Column({ type: 'uuid', nullable: true })
  cashier_id: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  admin_notes: string;

  @Column({ type: 'boolean', default: false })
  is_priority: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  // Relations
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: User;
}

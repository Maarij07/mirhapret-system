import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PromoCode } from './promo-code.entity';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity('promo_code_usage')
@Index('idx_code_usage_user', { synchronize: false })
@Index('idx_code_usage_order', { synchronize: false })
export class PromoCodeUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  promo_code_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  discount_amount: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => PromoCode)
  @JoinColumn({ name: 'promo_code_id' })
  promo_code: PromoCode;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}

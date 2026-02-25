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

@Entity('promo_codes')
@Index('idx_promo_codes_code', { synchronize: false })
@Index('idx_promo_codes_active', { synchronize: false })
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  discount_type: 'percentage' | 'fixed';

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  discount_value: number;

  @Column({ type: 'jsonb', default: '[]' })
  applicable_categories: string[];

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  min_purchase_amount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  max_discount_amount: number;

  @Column({ type: 'boolean', default: true })
  requires_login: boolean;

  @Column({ type: 'integer', nullable: true })
  usage_limit: number;

  @Column({ type: 'integer', default: 0 })
  usage_count: number;

  @Column({ type: 'integer', default: 1 })
  per_user_limit: number;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'uuid' })
  created_by_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;
}

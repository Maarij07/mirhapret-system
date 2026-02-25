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
import { Category } from './category.entity';
import { Product } from './product.entity';

@Entity('promotions')
@Index('idx_promotions_category', { synchronize: false })
@Index('idx_promotions_product', { synchronize: false })
@Index('idx_promotions_active', { synchronize: false })
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  discount_type: 'percentage' | 'fixed' | 'bogo';

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  discount_value: number;

  @Column({ type: 'varchar', length: 50 })
  promotion_scope: 'category' | 'product' | 'store' | 'global';

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({ type: 'uuid', nullable: true })
  product_id: string;

  @Column({ type: 'uuid', nullable: true })
  store_id: string;

  @Column({ type: 'boolean', default: true })
  requires_login: boolean;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  min_purchase_amount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  max_discount_amount: number;

  @Column({ type: 'integer', nullable: true })
  usage_limit: number;

  @Column({ type: 'integer', default: 0 })
  usage_count: number;

  @Column({ type: 'uuid' })
  created_by_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @ManyToOne(() => Category, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Product, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

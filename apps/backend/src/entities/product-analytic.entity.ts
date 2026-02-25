import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('product_analytics')
@Index('idx_analytics_product', { synchronize: false })
@Index('idx_analytics_user', { synchronize: false })
@Index('idx_analytics_created', { synchronize: false })
@Index('idx_analytics_event', { synchronize: false })
export class ProductAnalytic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guest_session_id: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'varchar', length: 50 })
  event_type: 'view' | 'click' | 'add_to_cart' | 'purchase';

  @Column({ type: 'text', nullable: true })
  referrer: string;

  @Column({ type: 'integer', default: 0 })
  duration_seconds: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  device_type: 'mobile' | 'tablet' | 'desktop';

  @Column({ type: 'varchar', length: 100, default: 'Pakistan' })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Product, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

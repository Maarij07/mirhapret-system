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
import { Category } from './category.entity';

@Entity('products')
@Index('idx_products_sku', { synchronize: false })
@Index('idx_products_name', { synchronize: false })
@Index('idx_products_slug', { synchronize: false })
@Index('idx_products_category', { synchronize: false })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  category_id: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  cost_price: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  tax_rate: number;

  @Column({ type: 'text', nullable: true })
  main_image: string;

  @Column({ type: 'jsonb', default: '[]' })
  images: string[];

  @Column({ type: 'jsonb', default: '["S","M","L","XL"]' })
  available_sizes: string[];

  @Column({ type: 'text', nullable: true })
  size_guide_html: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode: string;

  @Column({ type: 'integer', default: 0 })
  view_count: number;

  @Column({ type: 'integer', default: 0 })
  purchase_count: number;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0 })
  average_rating: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}

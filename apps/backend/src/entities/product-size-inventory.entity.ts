import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_size_inventory')
@Unique('UQ_product_store_size', ['product_id', 'store_id', 'size'])
@Index('idx_size_inventory_product', { synchronize: false })
@Index('idx_size_inventory_store', { synchronize: false })
export class ProductSizeInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'uuid', nullable: true })
  store_id: string;

  @Column({ type: 'varchar', length: 10 })
  size: string;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ type: 'integer', default: 0 })
  reserved_quantity: number;

  @Column({ type: 'integer', default: 5 })
  low_stock_threshold: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Product, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

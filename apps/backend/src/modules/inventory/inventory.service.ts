import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSizeInventory } from '../../entities';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ProductSizeInventory)
    private inventoryRepository: Repository<ProductSizeInventory>,
  ) {}

  async getInventoryByProduct(
    productId: string,
    storeId?: string,
  ): Promise<ProductSizeInventory[]> {
    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.product_id = :productId', { productId });

    if (storeId) {
      query.andWhere('inventory.store_id = :storeId', { storeId });
    } else {
      query.andWhere('inventory.store_id IS NULL');
    }

    return query.getMany();
  }

  async getInventoryBySize(
    productId: string,
    size: string,
    storeId?: string,
  ): Promise<ProductSizeInventory | null> {
    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.product_id = :productId', { productId })
      .andWhere('inventory.size = :size', { size });

    if (storeId) {
      query.andWhere('inventory.store_id = :storeId', { storeId });
    } else {
      query.andWhere('inventory.store_id IS NULL');
    }

    return (await query.getOne()) || null;
  }

  async updateInventory(
    id: string,
    quantity: number,
  ): Promise<ProductSizeInventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    await this.inventoryRepository.update(id, { quantity });
    const updated = await this.inventoryRepository.findOne({ where: { id } });
    return updated!;
  }

  async reserveInventory(
    id: string,
    quantity: number,
  ): Promise<ProductSizeInventory> {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive integer');
    }

    const inventory = await this.inventoryRepository.findOne({
      where: { id },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    await this.inventoryRepository.update(id, {
      reserved_quantity: () => `reserved_quantity + ${quantity}`,
    });

    const updated = await this.inventoryRepository.findOne({ where: { id } });
    return updated!;
  }

  async releaseReservedInventory(
    id: string,
    quantity: number,
  ): Promise<ProductSizeInventory> {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive integer');
    }

    const inventory = await this.inventoryRepository.findOne({
      where: { id },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    await this.inventoryRepository.update(id, {
      reserved_quantity: () => `GREATEST(0, reserved_quantity - ${quantity})`,
    });

    const updated = await this.inventoryRepository.findOne({ where: { id } });
    return updated!;
  }

  async getAvailableQuantity(id: string): Promise<number> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventory.quantity - (inventory.reserved_quantity || 0);
  }
}
